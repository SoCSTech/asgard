interface Props {
  children?: React.ReactNode;
  href: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export function HeaderLink(props: Props) {
  const currentSection = window.location.pathname.split("/")[1];
  const buttonSection = props.href.split("/")[1];

  if (currentSection === buttonSection) {
    return (
      <li className="rounded hover:bg-accent hover:text-accent-foreground my-1 tablet:my-0 tablet:mr-5 px-2 tablet:px-1 tablet:underline bg-white tablet:bg-inherit text-black tablet:text-white">
        <a href={props.href}>{props.children}</a>
      </li>
    );
  } else {
    return (
      <li
        className="rounded hover:bg-accent hover:text-accent-foreground my-1 tablet:my-0 tablet:mr-5 px-2 tablet:px-1"
      >
        <a href={props.href}>{props.children}</a>
      </li>
    );
  }
}

export function HeaderLinkGroup({ children }: Props) {
  return (
    <ul className="hidden tablet:flex flex-col tablet:flex-row tablet:items-center tablet:justify-center text-3xl tablet:text-base my-5 tablet:my-0">
      {children}
    </ul>
  );
}
