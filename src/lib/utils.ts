export const firstLastMonthDays = (): [Date, Date] => {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Asegurarse de que la hora sea 23:59:59.999 para el último día
    lastDay.setHours(23, 59, 59, 999);
    
    return [firstDay, lastDay];
}