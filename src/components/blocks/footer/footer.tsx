import { Separator } from "@/components/ui/separator";
const FooterSection = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="grow bg-muted" />
      <footer>
        <Separator />
        <div className="w-full mx-auto">
          <div className="py-12 flex flex-col justify-start items-center">
            {/* Logo */}
            <a href="/">
              <img
                src="/horizontal-ute-logo.png"
                alt="HCMUTE Logo"
                className="h-10 w-auto object-contain"
              />
            </a>

            {/* <ul className="mt-6 flex items-center gap-4 flex-wrap">
              {footerLinks.map(({ title, href }) => (
                <li key={title}>
                  <a
                    href={href}
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul> */}
            <span className="pt-4 text-center text-blue-800/90 font-medium leading-relaxed">
              &copy; {new Date().getFullYear()}{" "}
              <a href="/" target="_blank" className="font-semibold text-blue-600 hover:underline">
                bandoso.yhcmute.com
              </a>
              <br />
              Bản quyền thuộc về Đoàn Trường Đại học Sư phạm Kỹ thuật TP. Hồ Chí
              Minh.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterSection;
