import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const manager_ids = prisma.employee.findMany({
  where: {},
  distinct: ["manager_id"],
  select: {
    manager_id: true,
  },
});

const compliance = prisma.employee.findMany({
    where: {
      sis_id: 100,
    },
    include:{
      group:{
        select:{
          name:true
        }
      }
    }
  }).then((data)=>{
    console.log(data)
  })

console.log(compliance);