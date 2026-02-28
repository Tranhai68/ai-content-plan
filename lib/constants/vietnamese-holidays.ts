export interface Holiday {
    name: string
    date: string
    isLunar: boolean
    category: 'holiday' | 'shopping' | 'cultural' | 'international' | 'marketing'
    description: string
    contentSuggestions: string[]
    icon: string
}

export const VIETNAMESE_HOLIDAYS: Holiday[] = [
    // ===== THÁNG 1 =====
    { name: 'Tết Dương lịch', date: '01-01', isLunar: false, category: 'holiday', icon: '🎉', description: 'Ngày đầu năm mới Dương lịch', contentSuggestions: ['Chia sẻ mục tiêu năm mới', 'Review năm cũ', 'Chương trình Sale đầu năm', 'Lời chúc năm mới từ thương hiệu'] },
    { name: 'Tết Nguyên Đán', date: '01-01', isLunar: true, category: 'holiday', icon: '🏮', description: 'Tết cổ truyền Việt Nam', contentSuggestions: ['Chúc Tết khách hàng', 'Khuyến mãi Tết', 'Văn hóa Tết Việt', 'Behind the scenes chuẩn bị Tết'] },

    // ===== THÁNG 2 =====
    { name: 'Valentine', date: '02-14', isLunar: false, category: 'shopping', icon: '💝', description: 'Ngày lễ Tình nhân', contentSuggestions: ['Sale Valentine', 'Gợi ý quà Valentine', 'Câu chuyện tình yêu thương hiệu', 'Content couple/đôi'] },
    { name: 'Rằm tháng Giêng', date: '01-15', isLunar: true, category: 'cultural', icon: '🏮', description: 'Tết Nguyên Tiêu', contentSuggestions: ['Văn hóa Tết Nguyên Tiêu', 'Lễ hội đèn lồng'] },

    // ===== THÁNG 3 =====
    { name: 'Ngày Quốc tế Phụ nữ', date: '03-08', isLunar: false, category: 'holiday', icon: '🌷', description: 'Tôn vinh phụ nữ toàn cầu', contentSuggestions: ['Chúc mừng 8/3', 'Sale 8/3', 'Câu chuyện phụ nữ truyền cảm hứng', 'Quà tặng 8/3'] },
    { name: 'Ngày Quyền Người tiêu dùng', date: '03-15', isLunar: false, category: 'international', icon: '🛒', description: 'World Consumer Rights Day', contentSuggestions: ['Cam kết chất lượng', 'Review sản phẩm', 'Chính sách bảo hành'] },
    { name: 'Ngày Nước Thế giới', date: '03-22', isLunar: false, category: 'international', icon: '💧', description: 'World Water Day', contentSuggestions: ['Bảo vệ môi trường', 'Sản phẩm xanh', 'Trách nhiệm xã hội'] },
    { name: 'Giờ Trái Đất', date: '03-29', isLunar: false, category: 'international', icon: '🌍', description: 'Earth Hour', contentSuggestions: ['Tắt đèn 1 giờ', 'Chiến dịch xanh', 'Bảo vệ hành tinh'] },

    // ===== THÁNG 4 =====
    { name: 'Cá tháng Tư', date: '04-01', isLunar: false, category: 'cultural', icon: '🤡', description: 'Ngày nói dối', contentSuggestions: ['Content hài hước', 'Mini game vui', 'Prank marketing', 'Fact vs Fiction'] },
    { name: 'Giỗ Tổ Hùng Vương', date: '03-10', isLunar: true, category: 'holiday', icon: '🇻🇳', description: 'Ngày Giỗ Tổ Hùng Vương 10/3 Âm lịch', contentSuggestions: ['Tự hào dân tộc', 'Lịch sử Việt Nam', 'Văn hóa truyền thống'] },
    { name: 'Ngày Trái Đất', date: '04-22', isLunar: false, category: 'international', icon: '🌎', description: 'Earth Day', contentSuggestions: ['Sản phẩm thân thiện môi trường', 'Chiến dịch Go Green', 'Giảm rác thải nhựa'] },
    { name: 'Giải phóng miền Nam', date: '04-30', isLunar: false, category: 'holiday', icon: '🇻🇳', description: 'Ngày Giải phóng miền Nam thống nhất đất nước', contentSuggestions: ['Tự hào dân tộc', 'Lịch sử 30/4', 'Sale 30/4'] },

    // ===== THÁNG 5 =====
    { name: 'Quốc tế Lao động', date: '05-01', isLunar: false, category: 'holiday', icon: '⚒️', description: 'Ngày Quốc tế Lao động', contentSuggestions: ['Tri ân người lao động', 'Sale nghỉ lễ 30/4 - 1/5', 'Du lịch nghỉ lễ'] },
    { name: 'Ngày của Mẹ', date: '05-11', isLunar: false, category: 'shopping', icon: '👩‍👧', description: "Mother's Day (Chủ nhật thứ 2 tháng 5)", contentSuggestions: ['Quà tặng Ngày của Mẹ', 'Câu chuyện về mẹ', 'Sale Ngày của Mẹ', 'Content cảm xúc'] },
    { name: 'Ngày Sinh nhật Bác Hồ', date: '05-19', isLunar: false, category: 'holiday', icon: '⭐', description: 'Kỷ niệm ngày sinh Chủ tịch Hồ Chí Minh', contentSuggestions: ['Tưởng nhớ Bác', 'Giá trị cốt lõi', 'Trách nhiệm xã hội'] },

    // ===== THÁNG 6 =====
    { name: 'Quốc tế Thiếu nhi', date: '06-01', isLunar: false, category: 'cultural', icon: '👶', description: 'Ngày Quốc tế Thiếu nhi', contentSuggestions: ['Content trẻ em', 'Quà tặng 1/6', 'Mini game cho bé', 'Family content'] },
    { name: 'Ngày Môi trường Thế giới', date: '06-05', isLunar: false, category: 'international', icon: '🌿', description: 'World Environment Day', contentSuggestions: ['Green marketing', 'Sản phẩm xanh', 'CSR content'] },
    { name: 'Ngày của Bố', date: '06-15', isLunar: false, category: 'shopping', icon: '👨‍👧', description: "Father's Day (Chủ nhật thứ 3 tháng 6)", contentSuggestions: ['Quà tặng Ngày của Bố', 'Câu chuyện về bố', 'Sale Ngày của Bố'] },
    { name: 'Ngày Gia đình VN', date: '06-28', isLunar: false, category: 'cultural', icon: '👨‍👩‍👧‍👦', description: 'Ngày Gia đình Việt Nam', contentSuggestions: ['Content gia đình', 'Giá trị gia đình', 'Sản phẩm cho gia đình'] },

    // ===== THÁNG 7 =====
    { name: 'Sale 7/7', date: '07-07', isLunar: false, category: 'shopping', icon: '🛍️', description: 'Siêu Sale 7.7', contentSuggestions: ['Flash sale 7/7', 'Đếm ngược deal sốc', 'Livestream sale'] },
    { name: 'Lễ Vu Lan', date: '07-15', isLunar: true, category: 'cultural', icon: '🪷', description: 'Lễ Vu Lan báo hiếu (15/7 Âm lịch)', contentSuggestions: ['Content về mẹ', 'Báo hiếu', 'Giá trị gia đình', 'Từ thiện'] },
    { name: 'Ngày Tình bạn', date: '07-30', isLunar: false, category: 'cultural', icon: '🤝', description: 'International Friendship Day', contentSuggestions: ['Content bạn bè', 'Refer a friend', 'Mini game tag bạn'] },

    // ===== THÁNG 8 =====
    { name: 'Sale 8/8', date: '08-08', isLunar: false, category: 'shopping', icon: '🛍️', description: 'Siêu Sale 8.8', contentSuggestions: ['Flash sale 8/8', 'Deal đặc biệt', 'Voucher khuyến mãi'] },
    { name: 'Tết Trung thu', date: '08-15', isLunar: true, category: 'cultural', icon: '🥮', description: 'Tết Trung thu (15/8 Âm lịch)', contentSuggestions: ['Bánh trung thu', 'Quà tặng trung thu', 'Content vui chơi cho bé', 'Câu chuyện truyền thống'] },
    { name: 'Ngày Nhiếp ảnh Thế giới', date: '08-19', isLunar: false, category: 'international', icon: '📸', description: 'World Photography Day', contentSuggestions: ['Behind the scenes', 'Photo contest', 'Visual storytelling'] },

    // ===== THÁNG 9 =====
    { name: 'Quốc khánh', date: '09-02', isLunar: false, category: 'holiday', icon: '🇻🇳', description: 'Ngày Quốc khánh nước CHXHCN Việt Nam', contentSuggestions: ['Tự hào Việt Nam', 'Sale Quốc khánh', 'Made in Vietnam'] },
    { name: 'Back to School', date: '09-05', isLunar: false, category: 'shopping', icon: '🎒', description: 'Mùa tựu trường', contentSuggestions: ['Sale back to school', 'Content học sinh', 'Đồ dùng học tập', 'Tips mùa khai giảng'] },
    { name: 'Sale 9/9', date: '09-09', isLunar: false, category: 'shopping', icon: '🛍️', description: 'Siêu Sale 9.9', contentSuggestions: ['Flash sale 9/9', 'Deal cuối hè', 'Mega sale'] },

    // ===== THÁNG 10 =====
    { name: 'Sale 10/10', date: '10-10', isLunar: false, category: 'shopping', icon: '🛍️', description: 'Siêu Sale 10.10', contentSuggestions: ['Flash sale 10/10', 'Brand Day', 'Mega deal'] },
    { name: 'Ngày Doanh nhân VN', date: '10-13', isLunar: false, category: 'cultural', icon: '💼', description: 'Ngày Doanh nhân Việt Nam', contentSuggestions: ['Tri ân doanh nhân', 'Câu chuyện kinh doanh', 'CEO story'] },
    { name: 'Ngày Phụ nữ Việt Nam', date: '10-20', isLunar: false, category: 'holiday', icon: '🌹', description: 'Ngày Phụ nữ Việt Nam 20/10', contentSuggestions: ['Chúc mừng 20/10', 'Sale 20/10', 'Câu chuyện phụ nữ', 'Quà tặng 20/10'] },
    { name: 'Halloween', date: '10-31', isLunar: false, category: 'cultural', icon: '🎃', description: 'Lễ hội Halloween', contentSuggestions: ['Content Halloween', 'Trang trí Halloween', 'Sản phẩm giới hạn', 'Mini game ma quỷ'] },

    // ===== THÁNG 11 =====
    { name: 'Singles Day (11.11)', date: '11-11', isLunar: false, category: 'shopping', icon: '💫', description: 'Siêu Sale 11.11 - Ngày Độc thân', contentSuggestions: ['Mega sale 11/11', 'Deal shock', 'Flash sale theo giờ', 'Livestream bán hàng'] },
    { name: 'Ngày Nhà giáo VN', date: '11-20', isLunar: false, category: 'cultural', icon: '📚', description: 'Ngày Nhà giáo Việt Nam 20/11', contentSuggestions: ['Tri ân thầy cô', 'Quà tặng 20/11', 'Câu chuyện giáo dục', 'Content tri ân'] },
    { name: 'Thanksgiving', date: '11-27', isLunar: false, category: 'international', icon: '🦃', description: 'Lễ Tạ Ơn', contentSuggestions: ['Cảm ơn khách hàng', 'Thank you sale', 'Tri ân cuối năm'] },
    { name: 'Black Friday', date: '11-28', isLunar: false, category: 'shopping', icon: '🏷️', description: 'Black Friday – Ngày hội mua sắm lớn nhất năm', contentSuggestions: ['Giảm giá Black Friday', 'Deal 24h', 'Flash sale', 'Countdown'] },

    // ===== THÁNG 12 =====
    { name: 'Cyber Monday', date: '12-01', isLunar: false, category: 'shopping', icon: '💻', description: 'Cyber Monday – Mua sắm online', contentSuggestions: ['Sale online', 'Voucher code', 'Free shipping'] },
    { name: '12.12 Sale', date: '12-12', isLunar: false, category: 'shopping', icon: '🛍️', description: 'Siêu Sale 12.12 cuối năm', contentSuggestions: ['Mega sale 12/12', 'Deal cuối năm', 'Last chance sale'] },
    { name: 'Giáng Sinh', date: '12-25', isLunar: false, category: 'shopping', icon: '🎄', description: 'Lễ Giáng Sinh – Noel', contentSuggestions: ['Sale Giáng Sinh', 'Quà Noel', 'Trang trí Giáng Sinh', 'Content ấm áp'] },
    { name: 'Tất niên', date: '12-30', isLunar: true, category: 'cultural', icon: '🧨', description: 'Tiệc tất niên cuối năm', contentSuggestions: ['Tiệc tất niên', 'Review năm cũ', 'Cảm ơn khách hàng', 'Sale cuối năm'] },
    { name: 'Giao thừa', date: '12-31', isLunar: false, category: 'holiday', icon: '🎆', description: 'Đêm Giao thừa', contentSuggestions: ['Countdown', 'Lời chúc năm mới', 'Câu chuyện năm cũ'] },
]

export const CONTENT_TYPES = [
    { value: 'POST', label: 'Post', icon: '📝', color: '#3b82f6' },
    { value: 'VIDEO', label: 'Video', icon: '🎬', color: '#8b5cf6' },
    { value: 'LIVE_STREAM', label: 'Live Stream', icon: '📡', color: '#ef4444' },
    { value: 'IMAGE', label: 'Image', icon: '🖼️', color: '#10b981' },
    { value: 'MEME', label: 'Meme', icon: '😂', color: '#f59e0b' },
    { value: 'SALE', label: 'Sale', icon: '🏷️', color: '#dc2626' },
    { value: 'POLL', label: 'Poll', icon: '📊', color: '#6366f1' },
    { value: 'CAROUSEL', label: 'Carousel', icon: '🎠', color: '#ec4899' },
    { value: 'STORY', label: 'Story', icon: '📱', color: '#14b8a6' },
    { value: 'REEL', label: 'Reel', icon: '🎵', color: '#a855f7' },
] as const

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    holiday: { bg: '#fef2f2', text: '#dc2626', label: 'Ngày lễ' },
    shopping: { bg: '#fff7ed', text: '#ea580c', label: 'Mua sắm' },
    cultural: { bg: '#f0fdf4', text: '#16a34a', label: 'Văn hóa' },
    international: { bg: '#eff6ff', text: '#2563eb', label: 'Quốc tế' },
    marketing: { bg: '#fdf4ff', text: '#9333ea', label: 'Marketing' },
}

export function getHolidaysForMonth(year: number, month: number): Array<Holiday & { fullDate: string; day: number }> {
    const holidays: Array<Holiday & { fullDate: string; day: number }> = []

    for (const holiday of VIETNAMESE_HOLIDAYS) {
        if (holiday.isLunar) continue

        const [m, d] = holiday.date.split('-').map(Number)
        if (m === month) {
            const fullDate = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            holidays.push({ ...holiday, fullDate, day: d })
        }
    }

    return holidays.sort((a, b) => a.day - b.day)
}

export function getHolidaysInRange(startDate: Date, endDate: Date): Array<{ name: string; date: string; category: string; icon: string; contentSuggestions: string[] }> {
    const holidays: Array<{ name: string; date: string; category: string; icon: string; contentSuggestions: string[] }> = []

    for (const holiday of VIETNAMESE_HOLIDAYS) {
        if (holiday.isLunar) continue

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
                    icon: holiday.icon,
                    contentSuggestions: holiday.contentSuggestions,
                })
            }
        }
    }

    return holidays.sort((a, b) => a.date.localeCompare(b.date))
}
