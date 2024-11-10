import { Manage } from '@/features/manage';

export default function Page(props: { params: { id: string } }) {
  const id = props.params.id;

  return <Manage id={id} />;
}
