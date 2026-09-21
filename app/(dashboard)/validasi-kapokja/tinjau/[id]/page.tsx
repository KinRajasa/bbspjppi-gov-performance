import { redirect } from 'next/navigation';

export default async function TinjauLaporanKapokjaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/validasi-kapokja/detail/${id}`);
}

