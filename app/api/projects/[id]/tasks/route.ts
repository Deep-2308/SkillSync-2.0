import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // TODO: Implement task listing for a project
    console.log("Get tasks for project:", id);

    return NextResponse.json(
      { success: true, data: [], message: "Project tasks endpoint" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Tasks listing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Implement task creation
    console.log("Create task for project:", id, body);

    return NextResponse.json(
      { success: true, message: "Task creation endpoint" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Task creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}
