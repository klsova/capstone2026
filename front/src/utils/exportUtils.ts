import ExcelJS from 'exceljs';
import dayjs from 'dayjs';

//Only for demo test purposes in this stage to have a library and functionality
//for exporting an excel file. This has no correlation to the actual report generated with
//the final implementation

export const exportToExcel = async (detectedPeaks: any[], facility: string) => {
  if (!detectedPeaks || detectedPeaks.length === 0) {
    alert("No peaks in the chosen time period");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Emission peaks');

  worksheet.columns = [
    { header: 'Peak ID', key: 'id', width: 15 },
    { header: 'Start time', key: 'startTime', width: 20 },
    { header: 'End time', key: 'endTime', width: 20 },
    { header: 'Facility', key: 'facility', width: 20 },
    { header: 'Comments', key: 'comments', width: 40 },
    { header: 'Area-above-threshold', key: 'area', width: 15},
  ];

  worksheet.getRow(1).font = { bold: true };

  detectedPeaks.forEach(peak => {
    const start = dayjs(peak.startTime);
    const end = dayjs(peak.endTime);

    worksheet.addRow({
      id: peak.id,
      startTime: start.format('DD.MM.YYYY HH:mm:ss'),
      endTime: end.format('DD.MM.YYYY HH:mm:ss'),
      facility: facility,
      comments: '',
      area: peak.area
    })
  });



  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocuments.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${facility}_report_${dayjs().format('YYYY-MM-DD')}.xlsx`;
  anchor.click();

  window.URL.revokeObjectURL(url);
};