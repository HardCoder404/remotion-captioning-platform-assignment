import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { mkdir, writeFile, unlink } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let propsPath: string | null = null;

  try {
    const { videoUrl, captions, style } = await request.json();

    if (!videoUrl || !captions || !Array.isArray(captions)) {
      return NextResponse.json(
        { error: "Missing required fields or invalid captions format" },
        { status: 400 }
      );
    }

    console.log("Received render request:", {
      videoUrl,
      captionsCount: captions.length,
      style,
    });

    // Create output directory
    const outputDir = join(process.cwd(), "public", "outputs");
    await mkdir(outputDir, { recursive: true });

    const outputFilename = `captioned-${uuidv4()}.mp4`;
    const outputPath = join(outputDir, outputFilename);

    // Construct video path
    const videoFilePath = join(process.cwd(), "public", videoUrl);

    // Verify video file exists
    if (!existsSync(videoFilePath)) {
      console.error("Video file not found:", videoFilePath);
      return NextResponse.json(
        { error: "Video file not found", path: videoFilePath },
        { status: 404 }
      );
    }

    console.log("Video file found:", videoFilePath);

    // Create props file
    const tempDir = join(process.cwd(), "temp");
    await mkdir(tempDir, { recursive: true });

    propsPath = join(tempDir, `props-${uuidv4()}.json`);

    const renderProps = {
      videoUrl: videoFilePath,
      captions,
      style: style || "bottom-centered",
    };

    await writeFile(propsPath, JSON.stringify(renderProps, null, 2));

    console.log("Props file created:", propsPath);

    const command = `npx remotion render src/remotion/Root.tsx CaptionedVideo ${outputPath} --props=${propsPath}`;

    console.log("Executing command:", command);

    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 50,
      timeout: 300000,
    });

    console.log("Remotion stdout:", stdout);
    if (stderr) {
      console.log("Remotion stderr:", stderr);
    }

    // Verify output file was created
    if (!existsSync(outputPath)) {
      throw new Error("Output video file was not created");
    }

    console.log("Render complete! Output:", outputPath);

    // Clean up props file
    if (propsPath && existsSync(propsPath)) {
      await unlink(propsPath);
    }

    return NextResponse.json({
      success: true,
      url: `/outputs/${outputFilename}`,
      message: "Video rendered successfully",
    });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error: any = e;
    console.error("Render error:", error);

    if (propsPath && existsSync(propsPath)) {
      try {
        await unlink(propsPath);
      } catch (cleanupError) {
        console.error("Failed to cleanup props file:", cleanupError);
      }
    }

    return NextResponse.json(
      {
        error: "Failed to render video",
        details: error.message,
        stdout: error.stdout,
        stderr: error.stderr,
      },
      { status: 500 }
    );
  }
}

export const maxDuration = 300;
