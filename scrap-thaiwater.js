const puppeteer = require('puppeteer');


function parseData(line) {
    // Regular Expression สำหรับจับข้อมูลแต่ละส่วน
    const regex = /^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/;
    const match = line.match(regex);
  
    if (match) {
      const [, name, locationParts, waterLevels, status, timestamp] = match;
      const location = locationParts.join(' ');
  
      return {
        name,
        location,
        timestamp,
        water_level: waterLevels.map(Number),
        status
      };
    } else {
      console.error('Invalid data format:', line);
      return null;
    }
  }

function parseWaterData(data) {
    const regex = /(.+)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\w+)\s+(\w+)?\s*(.+)?/g;
    const results = [];
  
    let match;
    while ((match = regex.exec(data))) {
      const [_, location, level1, level2, level3, status, additionalInfo, timestamp] = match;
      results.push({
        location,
        waterLevels: [parseFloat(level1), parseFloat(level2), parseFloat(level3)],
        status,
        additionalInfo,
        timestamp: timestamp ? timestamp : '22:10' // กำหนดค่าเริ่มต้นสำหรับ timestamp
      });
    }
  
    return results;
  }

function display_parserDataToJson(params) {
  let cleanedData = params.map(item => item.trim());

  if ( (cleanedData[1] ) == undefined ) {
    return
  }

  let time = cleanedData[0].match(/\d{2}:\d{2}/)[0]; // หาส่วนที่เป็นเวลา (HH:MM)
  cleanedData[0] = cleanedData[0].replace(/\d{2}:\d{2}/, ''); // ลบเวลาออกจากสตริงแรก

  cleanedData.splice(1, 0, time);

  // console.log(JSON.parse(
  //   JSON.stringify({ 
  //     "Location": cleanedData[0],
  //     "Time": cleanedData[1],
  //     "WaterLevel": cleanedData[2],
  //     "BankLevel": cleanedData[4],
  //     "Rainfall": cleanedData[6],
  //     "WaterLevelLabel": cleanedData[7],
  //   })
  // ));

     console.log(JSON.stringify({ 
      "Location": cleanedData[0],
      "Time": cleanedData[1],
      "WaterLevel": cleanedData[2],
      "BankLevel": cleanedData[4],
      "Rainfall": cleanedData[6],
      "WaterLevelLabel": cleanedData[7],
    }));
  
}

async function scrapeData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // ไปยัง URL
    await page.goto('https://tiwrmdev.hii.or.th/v3/telemetering/wl/warning', {
        waitUntil: 'networkidle2'
    });

    // ดึงข้อมูลที่ต้องการ
    const warnings = await page.evaluate(() => {
        const elements = document.querySelectorAll('#app > div > table > tbody > tr '); // เปลี่ยน .warning-class ตามที่ต้องการ
        return Array.from(elements).map(element => element.textContent);
    });

    // console.log(warnings);

    for (let i = 1; i < warnings.length; i++) {
      const dataArray = warnings[i].split('\n')

      display_parserDataToJson(dataArray)
    }


    // const cleanedData = dataArray.map(item => item.trim());
    // // แยกเวลาออกจากสตริงแรก
    // const time = cleanedData[0].match(/\d{2}:\d{2}/)[0]; // หาส่วนที่เป็นเวลา (HH:MM)
    // cleanedData[0] = cleanedData[0].replace(/\d{2}:\d{2}/, ''); // ลบเวลาออกจากสตริงแรก

    // // แทรกเวลาเข้าไปในตำแหน่งที่ต้องการ
    // cleanedData.splice(1, 0, time);

    // console.log(cleanedData)
    // console.log(warnings.length)

    // console.log(JSON.stringify({ 
    //   "Location": cleanedData[0],
    //   "Time": cleanedData[1],
    //   "WaterLevel": cleanedData[2],
    //   "BankLevel": cleanedData[4],
    //   "Rainfall": cleanedData[6],
    //   "WaterLevelLabel": cleanedData[7],
    // }));

    // console.log(JSON.parse(
    //   JSON.stringify({ 
    //     "Location": cleanedData[0],
    //     "Time": cleanedData[1],
    //     "WaterLevel": cleanedData[2],
    //     "BankLevel": cleanedData[4],
    //     "Rainfall": cleanedData[6],
    //     "WaterLevelLabel": cleanedData[7],
    //   })
    // ));
    

    await browser.close();
}

scrapeData();