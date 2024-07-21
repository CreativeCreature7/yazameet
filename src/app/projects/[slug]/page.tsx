export default function Project({ params }: { params: { slug: string } }) {
  return <div>My Project: {params.slug}</div>;
}
