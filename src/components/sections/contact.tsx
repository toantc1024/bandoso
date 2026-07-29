import { MailIcon, MapPinIcon } from "lucide-react";
import { TextAnimate } from "../magicui/text-animate";

export function ContactSection() {
  return (
    <section className="pt-8 px-4 sm:pt-12 sm:px-6 md:pt-16 mb-32 lg:px-8  flex w-full justify-center">
      <div className="container">
        <h2 className="py-8 text-2xl text-center font-extrabold text-blue-950 md:text-4xl lg:text-5xl">
          <TextAnimate animation="blurIn" as="h1">
            Liên hệ với chúng tôi
          </TextAnimate>
        </h2>
        <p className="mt-2 text-base text-center sm:text-lg text-blue-700 font-medium max-w-xl mx-auto">
          Hãy kết nối để được tư vấn giải pháp, hỗ trợ nhanh chóng
        </p>
        <div className="max-w-screen-xl mx-auto py-8 flex flex-col md:flex-row justify-center gap-4 md:gap-24 px-6 md:px-0">
          <div className="text-center flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center bg-blue-100/80 text-blue-600 rounded-full border border-blue-200">
              <MailIcon className="w-6 h-6" />
            </div>
            <h3 className="mt-6 font-bold text-xl text-blue-950">Email</h3>
            <p className="mt-2 text-blue-800/90 font-medium">
              Bạn có thắc mắc? Hãy gửi email cho chúng tôi
            </p>
            <a
              className="mt-4 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-4"
              href="mailto:doantruong@hcmute.edu.vn"
            >
              doantruong@hcmute.edu.vn
            </a>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center bg-blue-100/80 text-blue-600 rounded-full border border-blue-200">
              <MapPinIcon className="w-6 h-6" />
            </div>
            <h3 className="mt-6 font-bold text-xl text-blue-950">Đơn vị thực hiện</h3>
            <p className="mt-2 text-blue-800/90 font-medium">
              Đoàn Trường Đại học Công nghệ Kỹ thuật Tp.HCM
            </p>
            <a
              className="mt-4 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-4 max-w-lg leading-relaxed"
              href="https://maps.google.com"
              target="_blank"
            >
              Số 1 Võ Văn Ngân, P. Linh Chiểu, P. Thủ Đức,
              <br /> Thành phố Hồ Chí Minh
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
