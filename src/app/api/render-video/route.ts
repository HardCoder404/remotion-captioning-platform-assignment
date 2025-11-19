import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { writeFile, unlink, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { getGridFSBucket } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Readable } from "stream";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let propsPath: string | null = null;
  let tempVideoPath: string | null = null;
  let outputPath: string | null = null;
  let tempVideoFilename: string | null = null;

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

    // Create temp directory in public folder (accessible via HTTP)
    const tempDir = join(process.cwd(), "public", "temp");
    await mkdir(tempDir, { recursive: true });

    // Download video from MongoDB to temp file in public folder
    const fileIdMatch = videoUrl.match(/\/api\/video\/([a-f0-9]+)/);

    if (!fileIdMatch) {
      return NextResponse.json(
        { error: "Invalid video URL format" },
        { status: 400 }
      );
    }

    const fileId = fileIdMatch[1];

    if (!ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const bucket = await getGridFSBucket();
    const objectId = new ObjectId(fileId);

    // Download video to public/temp folder
    tempVideoFilename = `input-${uuidv4()}.mp4`;
    tempVideoPath = join(tempDir, tempVideoFilename);

    const downloadStream = bucket.openDownloadStream(objectId);
    const chunks: Buffer[] = [];

    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }

    const videoBuffer = Buffer.concat(chunks);
    await writeFile(tempVideoPath, videoBuffer);

    console.log("Video downloaded to temp:", tempVideoPath);

    // Create output path in temp
    const outputFilename = `output-${uuidv4()}.mp4`;
    outputPath = join(tempDir, outputFilename);

    // Create props file with HTTP URL instead of file path
    propsPath = join(tempDir, `props-${uuidv4()}.json`);

    const renderProps = {
      videoUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/temp/${tempVideoFilename}`,
      captions,
      style: style || "bottom-centered",
    };

    await writeFile(propsPath, JSON.stringify(renderProps, null, 2));

    console.log("Props file created:", propsPath);
    console.log("Video URL for Remotion:", renderProps.videoUrl);

    const command = `npx remotion render src/remotion/Root.tsx CaptionedVideo "${outputPath}" --props="${propsPath}"`;

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

    // Upload rendered video back to MongoDB
    const outputBuffer = await readFile(outputPath);

    const readableStream = new Readable();
    readableStream.push(outputBuffer);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(`rendered-${uuidv4()}.mp4`, {
      metadata: {
        contentType: "video/mp4",
        type: "rendered",
        originalFileId: fileId,
        createdAt: new Date(),
        size: outputBuffer.length,
      },
    });

    await new Promise((resolve, reject) => {
      readableStream
        .pipe(uploadStream)
        .on("finish", resolve)
        .on("error", reject);
    });

    const renderedFileId = uploadStream.id.toString();

    // Clean up temp files
    if (propsPath && existsSync(propsPath)) {
      await unlink(propsPath);
    }
    if (tempVideoPath && existsSync(tempVideoPath)) {
      await unlink(tempVideoPath);
    }
    if (outputPath && existsSync(outputPath)) {
      await unlink(outputPath);
    }

    return NextResponse.json({
      success: true,
      url: `/api/video/${renderedFileId}`,
      fileId: renderedFileId,
      message: "Video rendered successfully",
    });
  } catch (e) {
    const error = e as Error & { stdout?: string; stderr?: string };
    console.error("Render error:", error);

    // Cleanup on error
    if (propsPath && existsSync(propsPath)) {
      try {
        await unlink(propsPath);
      } catch (cleanupError) {
        console.error("Failed to cleanup props file:", cleanupError);
      }
    }
    if (tempVideoPath && existsSync(tempVideoPath)) {
      try {
        await unlink(tempVideoPath);
      } catch (cleanupError) {
        console.error("Failed to cleanup temp video:", cleanupError);
      }
    }
    if (outputPath && existsSync(outputPath)) {
      try {
        await unlink(outputPath);
      } catch (cleanupError) {
        console.error("Failed to cleanup output video:", cleanupError);
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
