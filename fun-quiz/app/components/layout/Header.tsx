interface HeaderProps {}

function Header(props: HeaderProps) {
  const {} = props;

  return (
    <>
      <header className="text-white text-xs h-nav w-full fixed z-[100] pc:mix-blend-difference header-transition">
        <div className="inner h-full">
          <div className="flex gap-[10%] h-full items-center">
            <div className=""></div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
