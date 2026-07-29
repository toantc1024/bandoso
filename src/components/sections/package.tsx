import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CircleCheck } from "lucide-react";
const packages = [
  {
    name: "Học sinh – Sinh viên",
    description: "Khám phá lịch sử sinh động qua trải nghiệm thực tế ảo.",
    features: [
      "Tiếp cận di tích mọi lúc, mọi nơi",
      "Học lịch sử trực quan",
      "Tăng khả năng ghi nhớ",
      "Trò chơi & video 360",
      "Trải nghiệm học mà chơi",
    ],
    buttonText: "Khám phá ngay",
  },
  {
    name: "Giáo viên",
    isRecommended: true,
    description: "Công cụ hỗ trợ giảng dạy sinh động, dễ tiếp thu hơn.",
    features: [
      "Bài giảng gắn liền thực tiễn",
      "Tài nguyên số phong phú",
      "Tăng tính tương tác lớp học",
      "Trực quan hoá nội dung",
      "Dễ tích hợp vào bài giảng",
    ],
    buttonText: "Ứng dụng trong giảng dạy",
    isPopular: false,
  },
  {
    name: "Cán bộ Đoàn – Hội – Đội",
    description:
      "Giải pháp truyền thông sáng tạo, giáo dục truyền thống hiệu quả.",
    features: [
      "Tổ chức tham quan ảo",
      "Tạo nội dung thu hút giới trẻ",
      "Lan toả trên mạng xã hội",
      "Ứng dụng công nghệ vào tuyên truyền",
    ],
    buttonText: "Tổ chức hoạt động ngay",
  },
];

import { TextAnimate } from "../magicui/text-animate";
export function PackageSection() {
  return (
    <section className="pt-8 px-4 pb-32 sm:pt-12 sm:px-6 md:pt-8 lg:px-32  flex w-full justify-center">
      <div className="container ">
        <h2 className="py-8 text-2xl text-center font-extrabold text-blue-950 md:text-4xl lg:text-5xl">
          <TextAnimate animation="blurIn" as="h1">
            Giá trị mang lại
          </TextAnimate>
        </h2>
        <div className="mt-2 max-w-screen-lg mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {packages.map((_package) => (
            <div key={_package.name}>
              <div className="border border-blue-200/90 bg-white/95 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold text-blue-950">{_package.name}</h3>
                  <p className="mt-2 text-sm font-medium text-blue-700 leading-relaxed">
                    {_package.description}
                  </p>
                  <Separator className="my-4 bg-blue-100" />
                  <ul className="space-y-2.5">
                    {_package.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-blue-900 font-medium">
                        <CircleCheck className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />{" "}
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full mt-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {_package.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
