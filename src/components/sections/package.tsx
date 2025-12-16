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
import GradientCardBlock from "../blocks/GradientCardBlock";
export function PackageSection() {
  return (
    <section className="pt-8 px-4 pb-32 sm:pt-12 sm:px-6 md:pt-8 lg:px-32  flex w-full justify-center">
      <div className="container ">
        <h2 className="py-8  text-2xl text-center font-bold md:text-4xl lg:text-5xl">
          <TextAnimate animation="blurIn" as="h1">
            Giá trị mang lại
          </TextAnimate>
        </h2>
        <div className="mt-2 max-w-screen-lg mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          {packages.map((_package) => (
            <div key={_package.name}>
              <GradientCardBlock className="border rounded-lg p-6">
                <h3 className="text-lg font-medium">{_package.name}</h3>
                <p className="mt-4 font-medium text-muted-foreground">
                  {_package.description}
                </p>
                <Separator className="my-4" />
                <ul className="space-y-2">
                  {_package.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CircleCheck className="h-4 w-4 mt-1 text-green-600" />{" "}
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={_package.isPopular ? "default" : "outline"}
                  size="lg"
                  className="w-full mt-6"
                >
                  {_package.buttonText}
                </Button>
              </GradientCardBlock>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
