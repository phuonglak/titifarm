import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaultDest = await prisma.destination.upsert({
    where: { slug: "titifarm" },
    update: {},
    create: { slug: "titifarm", name: "TitiFarm" },
  });

  const today = new Date();
  const addDays = (d: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + d);

  const tours = [
    {
      slug: "tour-vuon-rau-huu-co",
      title: "Tour vườn rau hữu cơ",
      description:
        "Trải nghiệm thu hoạch rau sạch, tìm hiểu quy trình canh tác hữu cơ, ủ phân vi sinh và chế biến món salad đơn giản.\n\nHoạt động phù hợp cho gia đình, giúp trẻ phát triển kỹ năng vận động tinh, tư duy quan sát và ý thức bảo vệ môi trường.",
      image: "https://picsum.photos/seed/farm-garden/800/500",
      basePrice: 200000,
      departures: [addDays(3), addDays(10), addDays(17)],
    },
    {
      slug: "tour-lam-banh-tu-nong-san",
      title: "Tour làm bánh từ nông sản",
      description:
        "Học cách chế biến nông sản thành bánh thơm ngon: cân đong, nhào bột, tạo hình và nướng bánh.\n\nTrẻ sẽ được rèn luyện tính kỷ luật, khả năng làm việc nhóm và tinh thần sáng tạo dưới sự hướng dẫn của nhân viên TitiFarm.",
      image: "https://picsum.photos/seed/farm-bakery/800/500",
      basePrice: 220000,
      departures: [addDays(5), addDays(12), addDays(19)],
    },
  ];

  for (const t of tours) {
    const tour = await prisma.tour.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        slug: t.slug,
        title: t.title,
        description: t.description,
        basePrice: t.basePrice,
        destinationId: defaultDest.id,
        images: { create: [{ url: t.image, sortOrder: 0 }] },
      },
    });

    for (const d of t.departures) {
      await prisma.departureSlot.upsert({
        where: { tourId_date: { tourId: tour.id, date: d } },
        update: {},
        create: {
          tourId: tour.id,
          date: d,
          capacity: 30,
          booked: 0,
          priceVnd: tour.basePrice,
          isActive: true,
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log("More sample tours created/updated with departures.");
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

