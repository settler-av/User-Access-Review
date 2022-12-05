import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import logger from "../src/utils/logger";
// import { employee } from "./data";

const seedMasterUser = async () => {
  let master_sis_id;
  await prisma.$transaction(
    async (_prisma) => {
      const salt = await bcrypt.genSalt(10);
      const hash_password = await bcrypt.hash("master", salt);

      const employee = await _prisma.employee.create({
        data: 
          {
            // "sis_id": 1,
            "name": "Adnan Vahora",
            "core_id": "VWNB84",
            "email": "adnan.vahora@motorolasolutions.com",
            "password": hash_password,
            "department": "ADMIN",
            // "group_sis_id": 1
          }
      });
      master_sis_id = employee.sis_id;
    },
    { timeout: 10000 }
  );
  console.log({ master_sis_id });
  return master_sis_id;
};

// seed groups
const seedGroups = async (master_sis_id: any) => {
  await prisma.$transaction(
    async (_prisma) => {
      const groups = [
        {
          // "sis_id": 1,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "ADMIN"
        },
        {
          // "sis_id": 2,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "COMPLIANCE"
        },
        {
          // "sis_id": 3,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "DEVOPS"
        },
        {
          // "sis_id": 4,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "QA"
        },
        {
          // "sis_id": 5,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "CLOUD"
        }
      ];
      await _prisma.group.createMany({
        data: groups,
      });
    },
    { timeout: 10000 }
  );
};

// seed employee
const hash_password = async (password: any) => {
  const salt = await bcrypt.genSalt(10);
  const hash_password = await bcrypt.hash(password, salt);
  return hash_password;
};
const get_group_sis_id = async (group_name: string) => {
  const group = await prisma.group.findFirst({
    where: {
      name: group_name,
    },
  });
  if(group){
    return group.sis_id;
  }
  console.log(`Group ${group_name} not found`);
  return null;
};
// get_group_sis_id("ADMIN").then((group_sis_id) => {
//   console.log({ group_sis_id });
// });

const get_manager_id_by_name = async (name: string) => {
  const employee = await prisma.employee.findFirst({
    where: {
      name: name,
    },
  });
  if(employee){
    return employee.sis_id;
  }
  console.log(`Employee ${name} not found`);
  return null;
};

const seedEmployee = async (master_sis_id: any) => {
  await prisma.$transaction(
    async (_prisma) => {
      const employees = [{
        // "sis_id": 2,
        "created_by": master_sis_id,
        "updated_by": master_sis_id,
        "name": "Rohan Sahu",
        "core_id": "VWNB85",
        "email": "rohan.sahu@motorolasolutions.com",
        "password": await hash_password("rohan"),
        "department": "DEVOPS",
        "group_sis_id": await get_group_sis_id("DEVOPS")
      },
      {
        // "sis_id": 3,
        "created_by": master_sis_id,
        "updated_by": master_sis_id,
        "name": "Sahil Patel",
        "core_id": "VWNB86",
        "email": "sahil.patel@motorolasolutions.com",
        "password": await hash_password("sahil"),
        "department": "CLOUD",
        "group_sis_id": await get_group_sis_id("CLOUD")
      },
      {
        // "sis_id": 4,
        "created_by": master_sis_id,
        "updated_by": master_sis_id,
        "name": "Rakesh Patel",
        "core_id": "VWNB87",
        "email": "rakesh.patel@motorolasolutions.com",
        "password": await hash_password("rakesh"),
        "department": "QA",
        "group_sis_id": await get_group_sis_id("QA")
      },
      {
        // "sis_id": 15,
        "created_by": master_sis_id,
        "updated_by": master_sis_id,
        "name": "Alia Henson",
        "core_id": "VWNB98",
        "email": "alia.henson@motorolasolutions.com",
        "password": await hash_password("alia"),
        "department": "COMPLIANCE",
        "group_sis_id": await get_group_sis_id("COMPLIANCE")
      }
    ];
    await _prisma.employee.createMany({
      data: employees,
    });
    },
    { timeout: 10000 }
  );

  await prisma.$transaction(
    async (_prisma) => {
      const employees = [
        
        {
          // "sis_id": 5,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Irene Choi",
          "core_id": "VWNB88",
          "email": "irene.choi@motorolasolutions.com",
          "password": await hash_password("irene"),
          "manager_id": await get_manager_id_by_name("Rakesh Patel"),
          "department": "QA",
          "group_sis_id": await get_group_sis_id("QA")
        },
        {
          // "sis_id": 6,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Armani Best",
          "core_id": "VWNB89",
          "email": "armani.best@motorolasolutions.com",
          "password": await hash_password("armani"),
          "manager_id": await get_manager_id_by_name("Rohan Sahu"),
          "department": "DEVOPS",
          "group_sis_id": await get_group_sis_id("DEVOPS")
        },
        {
          // "sis_id": 7,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Dillan Sharp",
          "core_id": "VWNB90",
          "email": "dillan.sharp@motorolasolutions.com",
          "password": await hash_password("dillan"),
          "manager_id": await get_manager_id_by_name("Rohan Sahu"),
          "department": "DEVOPS",
          "group_sis_id": await get_group_sis_id("DEVOPS")
        },
        {
          // "sis_id": 8,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Jonathon Dawson",
          "core_id": "VWNB91",
          "email": "jonathon.dawson@motorolasolutions.com",
          "password": await hash_password("jonathon"),
          "manager_id": await get_manager_id_by_name("Sahil Patel"),
          "department": "CLOUD",
          "group_sis_id": await get_group_sis_id("CLOUD")
        },
        {
          // "sis_id": 9,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Jay Fowler",
          "core_id": "VWNB92",
          "email": "jay.fowler@motorolasolutions.com",
          "password": await hash_password("jay"),
          "manager_id": await get_manager_id_by_name("Rakesh Patel"),
          "department": "QA",
          "group_sis_id": await get_group_sis_id("QA")
        },
        {
          // "sis_id": 10,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Gary Long",
          "core_id": "VWNB93",
          "email": "gary.long@motorolasolutions.com",
          "password": await hash_password("gary"),
          "manager_id": await get_manager_id_by_name("Rohan Sahu"),
          "department": "DEVOPS",
          "group_sis_id": await get_group_sis_id("DEVOPS")
        },
        {
          // "sis_id": 11,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Gracelyn Frazier",
          "core_id": "VWNB94",
          "email": "gracelyn.frazier@motorolasolutions.com",
          "password": await hash_password("gracelyn"),
          "manager_id": await get_manager_id_by_name("Rohan Sahu"),
          "department": "DEVOPS",
          "group_sis_id": await get_group_sis_id("DEVOPS")
        },
        {
          // "sis_id": 12,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Sofia Snyder",
          "core_id": "VWNB95",
          "email": "sofia.snyder@motorolasolutions.com",
          "password": await hash_password("sofia"),
          "manager_id": await get_manager_id_by_name("Sahil Patel"),
          "department": "CLOUD",
          "group_sis_id": await get_group_sis_id("CLOUD")
        },
        {
          // "sis_id": 13,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Ximena Ellis",
          "core_id": "VWNB96",
          "email": "ximena.ellis@motorolasolutions.com",
          "password": await hash_password("ximena"),
          "manager_id": await get_manager_id_by_name("Rakesh Patel"),
          "department": "QA",
          "group_sis_id": await get_group_sis_id("QA")
        },
        {
          // "sis_id": 14,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Madelynn Farmer",
          "core_id": "VWNB97",
          "email": "madelynn.farmer@motorolasolutions.com",
          "password": await hash_password("madelynn"),
          "manager_id": await get_manager_id_by_name("Rohan Sahu"),
          "department": "DEVOPS",
          "group_sis_id": await get_group_sis_id("DEVOPS")
        },
        {
          // "sis_id": 16,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Roland Colon",
          "core_id": "VWNB99",
          "email": "roland.colon@motorolasolutions.com",
          "password": await hash_password("roland"),
          "manager_id": await get_manager_id_by_name("Alia Henson"),
          "department": "COMPLIANCE",
          "group_sis_id": await get_group_sis_id("COMPLIANCE")
        },
        {
          // "sis_id": 17,
          "created_by": master_sis_id,
          "updated_by": master_sis_id,
          "name": "Alondra Browning",
          "core_id": "VWNB10",
          "email": "alondra.brown@motorolasolutions.com",
          "password": await hash_password("alondra"),
          "manager_id": await get_manager_id_by_name("Alia Henson") ,
          "department": "COMPLIANCE",
          "group_sis_id": await get_group_sis_id("COMPLIANCE")
        }
      ];
      await _prisma.employee.createMany({
        data: employees
      })
    },
    { timeout: 10000 }
  );
};

async function main() {
  console.log(`Start seeding ...`);
  // drop all data
  // const result:number = await prisma.$executeRaw`DROP DATABASE UserAccessReview`;
  // console.log(`Dropped database: affected rows ${result}`);
  // clear all tables
  let res: any = await prisma.group.deleteMany();
  console.log(`Cleared table group: affected rows ${res.count}`);
  res = await prisma.employee.deleteMany();
  console.log(`Cleared table employee: affected rows ${res.count}`);
  res = await prisma.review.deleteMany();
  console.log(`Cleared table review: affected rows ${res.count}`);
  const master_sis_id = await seedMasterUser();
  console.log(`Seeded master user: ${master_sis_id}`);
  await seedGroups(master_sis_id);
  console.log(`Seeded groups`);
  await seedEmployee(master_sis_id);
  console.log(`Seeded employees`);
}

main()
  .then(() => {
    console.log(`Seeding finished.`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

// const run = async() =>{
//     const neww = await prisma.employee.create({
//         data:{
//             name: "Asif Khan",
//             core_id: "VWNB85",
//             email: "temp@gmail.com",
//             password: await hash_password("asif"),
//         }
//     });

//     console.log({neww});
// };

// run();