export default function Page() {
  // need roles first

  // in theory a normal user that tries to go to this page will get some kind of error message

  // judge/admin that only has access to one hackathon will be automaticlly redirected to /console/id

  // superadmin or judge/admin with multiple hackathons will be able to see a list of them.
  // superadmins can create new ones

  return <div className="flex items-center justify-center">Homepage here</div>;
}
