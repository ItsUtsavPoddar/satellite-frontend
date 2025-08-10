const Footer = () => {
  let currentYear = new Date().getFullYear();

  return (
    <footer className=" font-cust z-10 px-4 py-4 flex justify-between items-center bg-[#0a0a0a] text-white ">
      {" "}
      <a href="https://utsavpoddar.tech" target="blank">
        <div>© {currentYear} Utsav Poddar. All rights reserved.</div>
      </a>
    </footer>
  );
};

export default Footer;
