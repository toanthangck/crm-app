import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import getDb from './db';

export function seedDatabase() {
    const db = getDb();

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count > 0) return;

    const adminId = uuidv4();
    const salesId1 = uuidv4();
    const salesId2 = uuidv4();

    const adminHash = bcryptjs.hashSync('admin123', 10);
    const userHash = bcryptjs.hashSync('user123', 10);

    db.prepare(`INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`).run(adminId, 'Admin User', 'admin@crm.com', adminHash, 'admin');
    db.prepare(`INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`).run(salesId1, 'Nguyễn Văn A', 'nguyen@crm.com', userHash, 'sales_rep');
    db.prepare(`INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`).run(salesId2, 'Trần Thị B', 'tran@crm.com', userHash, 'manager');

    const companies = [
        { id: uuidv4(), name: 'FPT Software', industry: 'Technology', size: '10000+', website: 'https://fpt-software.com', address: 'Hà Nội, Việt Nam', phone: '024 7300 7300', email: 'info@fpt.com.vn' },
        { id: uuidv4(), name: 'VNG Corporation', industry: 'Technology', size: '5000-10000', website: 'https://vng.com.vn', address: 'TP. Hồ Chí Minh, Việt Nam', phone: '028 3899 7999', email: 'contact@vng.com.vn' },
        { id: uuidv4(), name: 'Vingroup', industry: 'Real Estate', size: '10000+', website: 'https://vingroup.net', address: 'Hà Nội, Việt Nam', phone: '024 3974 9999', email: 'info@vingroup.net' },
        { id: uuidv4(), name: 'Masan Group', industry: 'Consumer Goods', size: '5000-10000', website: 'https://masangroup.com', address: 'TP. Hồ Chí Minh, Việt Nam', phone: '028 6256 3862', email: 'info@masangroup.com' },
        { id: uuidv4(), name: 'TechViet Solutions', industry: 'IT Consulting', size: '50-200', website: 'https://techviet.vn', address: 'Đà Nẵng, Việt Nam', phone: '0236 123 4567', email: 'hello@techviet.vn' },
    ];

    const insertCompany = db.prepare(`INSERT INTO companies (id, name, industry, size, website, address, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    companies.forEach(c => insertCompany.run(c.id, c.name, c.industry, c.size, c.website, c.address, c.phone, c.email));

    const contacts = [
        { id: uuidv4(), first_name: 'Phạm', last_name: 'Minh Tuấn', email: 'tuan.pham@fpt.com', phone: '0901234567', position: 'CTO', company_id: companies[0].id, owner_id: salesId1 },
        { id: uuidv4(), first_name: 'Lê', last_name: 'Thu Hà', email: 'ha.le@vng.com', phone: '0912345678', position: 'Product Manager', company_id: companies[1].id, owner_id: salesId1 },
        { id: uuidv4(), first_name: 'Hoàng', last_name: 'Đức Long', email: 'long.hoang@vingroup.net', phone: '0923456789', position: 'VP Sales', company_id: companies[2].id, owner_id: salesId2 },
        { id: uuidv4(), first_name: 'Ngô', last_name: 'Thị Mai', email: 'mai.ngo@masan.com', phone: '0934567890', position: 'Marketing Director', company_id: companies[3].id, owner_id: salesId2 },
        { id: uuidv4(), first_name: 'Vũ', last_name: 'Quang Huy', email: 'huy.vu@techviet.vn', phone: '0945678901', position: 'CEO', company_id: companies[4].id, owner_id: salesId1 },
        { id: uuidv4(), first_name: 'Đặng', last_name: 'Văn Khoa', email: 'khoa.dang@gmail.com', phone: '0956789012', position: 'Freelancer', company_id: null, owner_id: salesId1 },
        { id: uuidv4(), first_name: 'Bùi', last_name: 'Thanh Phong', email: 'phong.bui@fpt.com', phone: '0967890123', position: 'Project Manager', company_id: companies[0].id, owner_id: salesId2 },
        { id: uuidv4(), first_name: 'Trương', last_name: 'Minh Châu', email: 'chau.truong@vng.com', phone: '0978901234', position: 'Designer Lead', company_id: companies[1].id, owner_id: salesId1 },
    ];

    const insertContact = db.prepare(`INSERT INTO contacts (id, first_name, last_name, email, phone, position, company_id, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    contacts.forEach(c => insertContact.run(c.id, c.first_name, c.last_name, c.email, c.phone, c.position, c.company_id, c.owner_id));

    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const deals = [
        { id: uuidv4(), title: 'ERP System cho FPT', value: 500000000, stage: 'proposal', contact_id: contacts[0].id, company_id: companies[0].id, owner_id: salesId1, expected_close: '2026-04-15', description: 'Triển khai hệ thống ERP toàn diện' },
        { id: uuidv4(), title: 'Mobile App Development', value: 200000000, stage: 'qualified', contact_id: contacts[1].id, company_id: companies[1].id, owner_id: salesId1, expected_close: '2026-05-01', description: 'Phát triển ứng dụng mobile cho VNG' },
        { id: uuidv4(), title: 'Smart Home Solution', value: 1000000000, stage: 'negotiation', contact_id: contacts[2].id, company_id: companies[2].id, owner_id: salesId2, expected_close: '2026-03-30', description: 'Giải pháp nhà thông minh Vingroup' },
        { id: uuidv4(), title: 'Marketing Automation', value: 150000000, stage: 'lead', contact_id: contacts[3].id, company_id: companies[3].id, owner_id: salesId2, expected_close: '2026-06-01', description: 'Hệ thống marketing tự động cho Masan' },
        { id: uuidv4(), title: 'Cloud Migration', value: 300000000, stage: 'won', contact_id: contacts[4].id, company_id: companies[4].id, owner_id: salesId1, expected_close: '2026-02-28', description: 'Di chuyển sang cloud cho TechViet' },
        { id: uuidv4(), title: 'Data Analytics Platform', value: 400000000, stage: 'proposal', contact_id: contacts[6].id, company_id: companies[0].id, owner_id: salesId2, expected_close: '2026-04-20', description: 'Nền tảng phân tích dữ liệu' },
        { id: uuidv4(), title: 'CRM Integration', value: 100000000, stage: 'lost', contact_id: contacts[7].id, company_id: companies[1].id, owner_id: salesId1, expected_close: '2026-01-15', description: 'Tích hợp CRM cho VNG' },
        { id: uuidv4(), title: 'AI Chatbot Solution', value: 250000000, stage: 'lead', contact_id: contacts[5].id, company_id: null, owner_id: salesId2, expected_close: '2026-07-01', description: 'Giải pháp chatbot AI' },
    ];

    const insertDeal = db.prepare(`INSERT INTO deals (id, title, value, stage, contact_id, company_id, owner_id, expected_close, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    deals.forEach(d => insertDeal.run(d.id, d.title, d.value, d.stage, d.contact_id, d.company_id, d.owner_id, d.expected_close, d.description));

    const activities = [
        { id: uuidv4(), type: 'call', title: 'Gọi điện FPT', description: 'Thảo luận yêu cầu ERP', contact_id: contacts[0].id, deal_id: deals[0].id, company_id: companies[0].id, user_id: salesId1, due_date: '2026-03-07', status: 'todo' },
        { id: uuidv4(), type: 'meeting', title: 'Meeting VNG', description: 'Demo sản phẩm mobile app', contact_id: contacts[1].id, deal_id: deals[1].id, company_id: companies[1].id, user_id: salesId1, due_date: '2026-03-10', status: 'todo' },
        { id: uuidv4(), type: 'email', title: 'Gửi proposal Vingroup', description: 'Gửi báo giá chi tiết', contact_id: contacts[2].id, deal_id: deals[2].id, company_id: companies[2].id, user_id: salesId2, due_date: '2026-03-08', status: 'in_progress' },
        { id: uuidv4(), type: 'note', title: 'Ghi chú Masan', description: 'Cần follow up tuần sau', contact_id: contacts[3].id, deal_id: deals[3].id, company_id: companies[3].id, user_id: salesId2, due_date: '2026-03-12', status: 'todo' },
        { id: uuidv4(), type: 'call', title: 'Follow up TechViet', description: 'Xác nhận hoàn thành migration', contact_id: contacts[4].id, deal_id: deals[4].id, company_id: companies[4].id, user_id: salesId1, due_date: '2026-03-05', status: 'done' },
    ];

    const insertActivity = db.prepare(`INSERT INTO activities (id, type, title, description, contact_id, deal_id, company_id, user_id, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    activities.forEach(a => insertActivity.run(a.id, a.type, a.title, a.description, a.contact_id, a.deal_id, a.company_id, a.user_id, a.due_date, a.status));

    const notes = [
        { id: uuidv4(), content: 'Khách hàng rất quan tâm đến giải pháp ERP. Cần schedule demo tuần tới.', contact_id: contacts[0].id, deal_id: deals[0].id, company_id: companies[0].id, user_id: salesId1 },
        { id: uuidv4(), content: 'VNG yêu cầu tích hợp với hệ thống hiện tại. Cần review technical requirements.', contact_id: contacts[1].id, deal_id: deals[1].id, company_id: companies[1].id, user_id: salesId1 },
        { id: uuidv4(), content: 'Vingroup đang so sánh với 2 nhà cung cấp khác. Cần competitive pricing.', contact_id: contacts[2].id, deal_id: deals[2].id, company_id: companies[2].id, user_id: salesId2 },
    ];

    const insertNote = db.prepare(`INSERT INTO notes (id, content, contact_id, deal_id, company_id, user_id) VALUES (?, ?, ?, ?, ?, ?)`);
    notes.forEach(n => insertNote.run(n.id, n.content, n.contact_id, n.deal_id, n.company_id, n.user_id));
}
