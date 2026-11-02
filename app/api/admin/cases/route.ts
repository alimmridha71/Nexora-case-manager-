import { type NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { createCase, updateCase, deleteCase, listCases } from '@/lib/cases-service';

// Every handler verifies the admin session itself (defence in depth; middleware is a second layer).
const unauthorized = () => NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });

async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// GET /api/admin/cases?page=1&limit=20
export async function GET(request: NextRequest) {
  if (!(await verifyAdminSession()).isValid) return unauthorized();

  const params = new URL(request.url).searchParams;
  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '20', 10) || 20));

  const result = await listCases(page, limit);
  if (!result) return NextResponse.json({ error: 'Could not load cases.' }, { status: 500 });
  return NextResponse.json({
    cases: result.cases,
    pagination: { page, limit, totalCount: result.total, totalPages: Math.ceil(result.total / limit) },
  });
}

// POST /api/admin/cases — create a case
export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession()).isValid) return unauthorized();
  const result = await createCase(await readJson(request));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ success: true, case: result.data }, { status: 201 });
}

// PATCH /api/admin/cases — update status and/or matter
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdminSession()).isValid) return unauthorized();
  const result = await updateCase(await readJson(request));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ success: true, case: result.data });
}

// DELETE /api/admin/cases?id=123
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdminSession()).isValid) return unauthorized();
  const result = await deleteCase(new URL(request.url).searchParams.get('id'));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ success: true, deletedId: result.data.case_id });
}
