import { Suspense } from "react";

const fetchUserWithDelay = () =>
  new Promise((res) =>
    setTimeout(
      async () => res(await (await fetch("https://randomuser.me/api/")).json()),
      2000,
    ),
  );

// do not do this in production- always add a fallback with suspense or a loading.tsx when using an async component
export default async function Page(props: {
  params: Promise<{ year: string }>;
}) {
  const params = await props.params;
  const write = async () => {
    "use server";

    console.log("test");
  };

  return (
    <>
      <button onClick={write}>test server action</button>
      <Suspense fallback={"Loading..."}>
        <PeopleData />
      </Suspense>
      {params.year}
    </>
  );
}

async function PeopleData() {
  const data = await fetchUserWithDelay();
  return <div>{JSON.stringify(data)}</div>;
}
