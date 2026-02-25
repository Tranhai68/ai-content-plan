export const VIETNAMESE_HOLIDAYS = [
    { name: 'Tết Dương lịch', date: '01-01', isLunar: false, category: 'holiday' },
    { name: 'Tết Nguyên Đán', date: '01-01', isLunar: true, category: 'holiday' },
    { name: 'Valentine', date: '02-14', isLunar: false, category: 'shopping' },
    { name: 'Ngày Quốc tế Phụ nữ', date: '03-08', isLunar: false, category: 'holiday' },
    { name: 'Cá tháng Tư', date: '04-01', isLunar: false, category: 'cultural' },
    { name: 'Giỗ Tổ Hùng Vương', date: '03-10', isLunar: true, category: 'holiday' },
    { name: 'Giải phóng miền Nam', date: '04-30', isLunar: false, category: 'holiday' },
    { name: 'Quốc tế Lao động', date: '05-01', isLunar: false, category: 'holiday' },
    { name: 'Ngày của Mẹ', date: '05-12', isLunar: false, category: 'shopping' },
    { name: 'Ngày của Bố', date: '06-16', isLunar: false, category: 'shopping' },
    { name: 'Quốc tế Thiếu nhi', date: '06-01', isLunar: false, category: 'cultural' },
    { name: 'Lễ Vu Lan', date: '07-15', isLunar: true, category: 'cultural' },
    { name: 'Tết Trung thu', date: '08-15', isLunar: true, category: 'cultural' },
    { name: 'Quốc khánh', date: '09-02', isLunar: false, category: 'holiday' },
    { name: 'Ngày Phụ nữ Việt Nam', date: '10-20', isLunar: false, category: 'holiday' },
    { name: 'Halloween', date: '10-31', isLunar: false, category: 'cultural' },
    { name: 'Ngày Nhà giáo VN', date: '11-20', isLunar: false, category: 'cultural' },
    { name: 'Singles Day (11.11)', date: '11-11', isLunar: false, category: 'shopping' },
    { name: 'Black Friday', date: '11-29', isLunar: false, category: 'shopping' },
    { name: 'Cyber Monday', date: '12-02', isLunar: false, category: 'shopping' },
    { name: '12.12 Sale', date: '12-12', isLunar: false, category: 'shopping' },
    { name: 'Giáng Sinh', date: '12-25', isLunar: false, category: 'shopping' },
    { name: 'Tất niên', date: '12-30', isLunar: true, category: 'cultural' },
    { name: 'Ngày Doanh nhân VN', date: '10-13', isLunar: false, category: 'cultural' },
    { name: 'Ngày Gia đình VN', date: '06-28', isLunar: false, category: 'cultural' },
    { name: 'Ngày Tình bạn', date: '07-30', isLunar: false, category: 'cultural' },
    { name: 'Back to School', date: '09-05', isLunar: false, category: 'shopping' },
    { name: 'Ngày Độc thân (7/7)', date: '07-07', isLunar: true, category: 'cultural' },
]

export function getHolidaysInRange(startDate: Date, endDate: Date): Array<{ name: string; date: string; category: string }> {
    const holidays: Array<{ name: string; date: string; category: string }> = []

    for (const holiday of VIETNAMESE_HOLIDAYS) {
        if (holiday.isLunar) continue // Skip lunar dates for now (would need lunar calendar lib)

        const [month, day] = holiday.date.split('-').map(Number)
        const currentYear = startDate.getFullYear()
        const endYear = endDate.getFullYear()

        for (let year = currentYear; year <= endYear; year++) {
            const holidayDate = new Date(year, month - 1, day)
            if (holidayDate >= startDate && holidayDate <= endDate) {
                holidays.push({
                    name: holiday.name,
                    date: holidayDate.toISOString().split('T')[0],
                    category: holiday.category,
                })
            }
        }
    }

    return holidays.sort((a, b) => a.date.localeCompare(b.date))
}
