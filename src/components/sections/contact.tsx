import { MailIcon, MapPinIcon } from "lucide-react";
import { TextAnimate } from "../magicui/text-animate";

export function ContactSection() {
  return (
    <section className="pt-8 px-4 sm:pt-12 sm:px-6 md:pt-16 mb-32 lg:px-8  flex w-full justify-center">
      <div className="container">
        <h2 className="py-8  text-2xl text-center font-bold md:text-4xl lg:text-5xl">
          <TextAnimate animation="blurIn" as="h1">
            Liên hệ với chúng tôi
          </TextAnimate>
        </h2>
        <p className="mt-4 text-base text-center sm:text-lg">
          Hãy kết nối để được tư vấn giải pháp, hỗ trợ nhanh chóng
        </p>
        <div className="max-w-screen-xl mx-auto py-8 flex flex-col md:flex-row justify-center gap-4 md:gap-24 px-6 md:px-0">
          <div className="text-center flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center bg-primary/10 text-primary rounded-full">
              <MailIcon />
            </div>
            <h3 className="mt-6 font-semibold text-xl">Email</h3>
            <p className="mt-2 text-muted-foreground">
              Bạn có thắc mắc? Hãy gửi email cho chúng tôi
            </p>
            <a
              className="mt-4 font-medium text-primary"
              href="mailto:doantruong@hcmute.edu.vn"
            >
              doantruong@hcmute.edu.vn
            </a>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center bg-primary/10 text-primary rounded-full">
              <MapPinIcon />
            </div>
            <h3 className="mt-6 font-semibold text-xl">Đơn vị thực hiện</h3>
            <p className="mt-2 text-muted-foreground">
              Đoàn Trường Đại học Sư phạm Kỹ thuật Tp.HCM
            </p>
            <a
              className="mt-4 font-medium text-primary max-w-lg"
              href="https://map.google.com"
              target="_blank"
            >
              Số 1 Võ Văn Ngân, P. Thủ Đức,
              <br /> Thành phố Hồ Chí Minh
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
