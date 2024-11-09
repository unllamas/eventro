import { CheckOut } from '@/features/check-out';

export default function Page(props: { params: { id: string } }) {
  const id = props.params.id;

  return <CheckOut id={id} />;
}
