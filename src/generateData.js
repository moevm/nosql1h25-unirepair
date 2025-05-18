import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isFileEmpty = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  return content.trim().length === 0;
};

const generateData = (
  brigadesCount,
  operatorsCount,
  adminsCount,
  callFormsCount,
  reportsCount,
  inventoryCount,
) => {
  console.log("Генерация данных запущена...");

  const dataDir = path.join(__dirname, "data");
  const usersFile = path.join(dataDir, "users.json");
  const callFormsFile = path.join(dataDir, "call_forms.json");
  const reportsFile = path.join(dataDir, "reports.json");
  const inventoryFile = path.join(dataDir, "inventory.json");

  const usersEmpty = isFileEmpty(usersFile);
  const callFormsEmpty = isFileEmpty(callFormsFile);
  const reportsEmpty = isFileEmpty(reportsFile);
  const inventoryEmpty = isFileEmpty(inventoryFile);

  const users = [];
  const callForms = [];
  const reports = [];
  const inventory = [];
  const password =
    "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

  if (usersEmpty) {
    for (
      let brigadeNumber = 1;
      brigadeNumber <= brigadesCount;
      brigadeNumber++
    ) {
      users.push({
        role: "Brigadier",
        familyName: `Фёдоров_${brigadeNumber}`,
        firstName: "Игорь",
        fatherName: "Александрович",
        brigadeNumber,
        address: `г. Город_${brigadeNumber}, ул. Бригадная, д. ${brigadeNumber * 10}`,
        phone: `+7 (900) 000-${brigadeNumber}00`,
        email: `brigadier_${brigadeNumber}@example.com`,
        login: `brigadier_${brigadeNumber}`,
        password,
        registeredAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        status: "Active",
      });

      for (let i = 1; i <= 4; i++) {
        users.push({
          role: "Fireman",
          familyName: `Алексеев_${brigadeNumber}_${i}`,
          firstName: "Максим",
          fatherName: "Владимирович",
          brigadeNumber,
          address: `г. Город_${brigadeNumber}, ул. Пожарная, д. ${brigadeNumber * 10 + i}`,
          phone: `+7 (900) 111-${brigadeNumber}${i}11`,
          email: `fireman_${brigadeNumber}_${i}@example.com`,
          login: `fireman_${brigadeNumber}_${i}`,
          password,
          registeredAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          status: "Active",
        });
      }
    }

    for (let i = 1; i <= operatorsCount; i++) {
      users.push({
        role: "Operator",
        familyName: `Сидоров_${i}`,
        firstName: "Дмитрий",
        fatherName: "Николаевич",
        brigadeNumber: i,
        address: `г. Город_${i}, ул. Операторская, д. ${i * 5}`,
        phone: `+7 (911) 222-${i}22`,
        email: `operator_${i}@example.com`,
        login: `operator_${i}`,
        password,
        registeredAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        status: "Active",
      });
    }

    for (let i = 1; i <= adminsCount; i++) {
      users.push({
        role: "Admin",
        familyName: `Мельников_${i}`,
        firstName: "Сергей",
        fatherName: "Анатольевич",
        brigadeNumber: null,
        address: `г. Город_${i}, ул. Администраторская, д. ${i * 3}`,
        phone: `+7 (922) 333-${i}33`,
        email: `admin_${i}@example.com`,
        login: `admin_${i}`,
        password,
        registeredAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        status: "Active",
      });
    }
  }

  if (callFormsEmpty) {
    for (let i = 1; i <= callFormsCount; i++) {
      callForms.push({
        status: "Incomplete",
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        callSource: "автоматическая система",
        fireAddress: `г. Город_${i}, ул. Пожарная, д. ${i * 10}`,
        bottomLeft: {
          latitude: 59.9 + Math.random() * 0.1,
          longitude: 30.3 + Math.random() * 0.1,
        },
        topRight: {
          latitude: 59.9 + Math.random() * 0.1 + 0.005,
          longitude: 30.3 + Math.random() * 0.1 + 0.005,
        },
        fireType: ["заводской пожар", "жилой дом", "лесной пожар"][
          Math.floor(Math.random() * 3)
        ],
        fireRank: `${Math.floor(Math.random() * 4) + 1}`,
        victimsCount: Math.floor(Math.random() * 10),
        assignedTo: Array.from(
          { length: Math.floor(Math.random() * 3) + 1 },
          () => Math.floor(Math.random() * brigadesCount) + 1,
        ),
        auto: `Пожарная машина №${Math.floor(Math.random() * 10) + 1}`,
      });
    }
  }

  if (reportsEmpty) {
    const statuses = ["New", "Incomplete", "Complete"];
    const causes = [
      "неосторожное обращение с огнём",
      "поджог",
      "неисправность электропроводки",
      "неизвестно",
    ];

    for (let i = 1; i <= reportsCount; i++) {
      reports.push({
        status: statuses[Math.floor(Math.random() * statuses.length)],
        waterSpent: Math.floor(Math.random() * 1500),
        foamSpent: Math.floor(Math.random() * 300),
        allegedFireCause: causes[Math.floor(Math.random() * causes.length)],
        damage: Math.floor(Math.random() * 100000),
        additionalNotes:
          Math.random() < 0.5
            ? "Пожар был локализован быстро."
            : "Требуется дополнительное расследование.",
        modifiedAt: new Date().toISOString(),
      });
    }
  }

  if (inventoryEmpty) {
    for (let i = 1; i <= inventoryCount; i++) {
      inventory.push({
        name: `Пожарная машина №${i}`,
      });
    }
  }

  if (usersEmpty)
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
  if (callFormsEmpty)
    fs.writeFileSync(callFormsFile, JSON.stringify(callForms, null, 2), "utf8");
  if (reportsEmpty)
    fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2), "utf8");
  if (inventoryEmpty)
    fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2), "utf8");

  console.log("Генерация данных завершена!");
};

export default generateData;
