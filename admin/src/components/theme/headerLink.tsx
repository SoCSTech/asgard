interface Props {
  children?: React.ReactNode | undefined;
  href: string;
}

export function HeaderLink(props: Props) {
  const currentSection = window.location.pathname.split("/")[1];
  const buttonSection = props.href.split("/")[1];

  if (currentSection === buttonSection) {
    return (
      <li className="my-1 tablet:my-0 tablet:mr-5 px-2 tablet:px-0 tablet:underline bg-white tablet:bg-inherit text-black tablet:text-white rounded tablet:rounded-none ">
        <a href={props.href}>{props.children}</a>
      </li>
    );
  } else {
    return (
      <li className="my-1 tablet:my-0 tablet:mr-5 px-2 tablet:px-0">
        <a href={props.href}>{props.children}</a>
      </li>
    );
  }
}

export function HeaderLinkGroup(props: React.PropsWithChildren) {
  return (
    <ul className="hidden tablet:flex flex-col tablet:flex-row tablet:items-center text-3xl tablet:text-base my-5 tablet:my-0">
      {props.children}
    </ul>
  );
}
 