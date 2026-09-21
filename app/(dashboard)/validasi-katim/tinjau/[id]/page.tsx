import { redirect } from 'next/navigation';

export default async function TinjauLaporanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/validasi-katim/detail/${id}`);
}
