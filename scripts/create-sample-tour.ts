import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaultDest = await prisma.destination.upsert({
    where: { slug: "titifarm" },
    update: {},
    create: { slug: "titifarm", name: "TitiFarm" },
  });

  const slug = "tour-trai-nghiem-chan-nuoi";
  const tour = await prisma.tour.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      title: "Tour trải nghiệm chăn nuôi tại TitiFarm",
      description:
        "Khám phá đời sống nông trại qua hoạt động chăm sóc thú cưng và vật nuôi. Trẻ em sẽ được hướng dẫn cho thỏ, cừu, heo ăn, tìm hiểu thói quen sinh hoạt và học cách yêu thương động vật.\n\nChương trình kết hợp trò chơi vận động nhẹ, góc trồng cây nhỏ, và phần thưởng cuối giờ cho các bạn nhỏ hoàn thành thử thách. Mỗi hoạt động đều có nhân viên hướng dẫn, đảm bảo an toàn và giáo dục.",
      basePrice: 250000,
      destinationId: defaultDest.id,
      images: {
        create: [
          {
            url: "http://nongtraiongvang.com/upload/baiviet/cho-tho-cuu-heo-an-1-995.jpg",
            alt: "Cho thỏ, cừu, heo ăn tại nông trại",
            sortOrder: 0,
          },
        ],
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ id: tour.id, slug: tour.slug, title: tour.title }));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

