import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export const exportToExcel = async (
  annualPeaks: any[],
  facility: string,
  reportYear: number,
  mbqConstant: number
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${reportYear} Emissions`);

  worksheet.columns = [
    { header: 'Viikko', key: 'week', width: 15 },
    { header: 'Päästö/MBq', key: 'weeklyMBq', width: 20 },
    { header: 'Kumulatiivinen/MBq', key: 'cumulativeMBq', width: 25 },
  ];

  // header
  worksheet.getRow(1).font = { bold: true };

  const totalWeeks = dayjs(`${reportYear}-12-28`).isoWeek();

  const weeklyData = Array.from({ length: totalWeeks }, (_, i) => ({
    week: i + 1,
    mbq: 0
  }));

  annualPeaks.forEach(peak => {
    const peakDate = dayjs(peak.startTime);
    let weekNum = peakDate.isoWeek();

    // If December and week 1, add to last week
    // of the report year instead (52/53)
    if (peakDate.month() === 11 && weekNum === 1) {
      weekNum = totalWeeks;
    }

    // If January and week 52/53, add to first week
    // of the report year instead
    if (peakDate.month() === 0 && weekNum >= 52) {
      weekNum = 1;
    }

    // Calculate MBq for the week
    const targetWeek = weeklyData[weekNum - 1];
    if (targetWeek && peak.area) {
      targetWeek.mbq += (peak.area / mbqConstant);
    }
  });

  let runningCumulative = 0;

  weeklyData.forEach(data => {

    runningCumulative += data.mbq;

    const row = worksheet.addRow({
      week: data.week,
      weeklyMBq: data.mbq,
      cumulativeMBq: runningCumulative
    });

    // format larget numbers with comma
    row.getCell('weeklyMBq').numFmt = '#,##0';
    row.getCell('cumulativeMBq').numFmt = '#,##0';
  });

  worksheet.addRow([]);
  const totalRow = worksheet.addRow({
    week: '',
    weeklyMBq: '',
    cumulativeMBq: runningCumulative
  });
  totalRow.getCell('cumulativeMBq').numFmt = '#,##0';
  totalRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocuments.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${facility}_Päästöt_${reportYear}.xlsx`;
  anchor.click();

  window.URL.revokeObjectURL(url);
};