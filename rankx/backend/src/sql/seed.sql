-- Seed categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
('Tech Founders', 'tech-founders', 'Visionary technology company founders and co-founders', 'Rocket', '#3B82F6'),
('AI & ML Experts', 'ai-ml-experts', 'Leading minds in artificial intelligence and machine learning', 'Brain', '#8B5CF6'),
('Crypto & Web3', 'crypto-web3', 'Blockchain innovators and Web3 pioneers', 'Bitcoin', '#F59E0B'),
('Developer Advocates', 'developer-advocates', 'Champions of developer experience and education', 'Code', '#10B981'),
('Tech Journalists', 'tech-journalists', 'Technology reporters and media personalities', 'Newspaper', '#EF4444'),
('VC & Investors', 'vc-investors', 'Venture capitalists and angel investors', 'TrendingUp', '#06B6D4'),
('Open Source', 'open-source', 'Open source maintainers and contributors', 'GitBranch', '#F97316'),
('Cybersecurity', 'cybersecurity', 'Security researchers and cybersecurity experts', 'Shield', '#DC2626'),
('Design & UX', 'design-ux', 'UI/UX designers and design thought leaders', 'Palette', '#EC4899'),
('Data Science', 'data-science', 'Data scientists and analytics experts', 'BarChart', '#14B8A6'),
('DevOps & Cloud', 'devops-cloud', 'Cloud architects and DevOps engineers', 'Cloud', '#6366F1'),
('Gaming & Esports', 'gaming-esports', 'Gaming industry leaders and esports personalities', 'Gamepad2', '#A855F7'),
('Indie Hackers', 'indie-hackers', 'Solo founders and bootstrapped startup builders', 'Hammer', '#F59E0B'),
('Tech Policy', 'tech-policy', 'Technology policy makers and digital rights advocates', 'Scale', '#64748B'),
('Women in Tech', 'women-in-tech', 'Women leaders and innovators in technology', 'Sparkles', '#E879F9'),
('Content Creators', 'content-creators', 'Tech YouTubers, podcasters, and content creators', 'Video', '#EF4444'),
('Startup Mentors', 'startup-mentors', 'Experienced mentors and startup advisors', 'GraduationCap', '#0EA5E9'),
('Product Managers', 'product-managers', 'Product management leaders and strategists', 'Layout', '#8B5CF6'),
('Mobile Dev', 'mobile-dev', 'Mobile app developers and iOS/Android experts', 'Smartphone', '#10B981');

-- Seed badges
INSERT INTO badges (name, description, icon, color, criteria_type, criteria_value) VALUES
('Rising Star', 'Received 10+ votes across all categories', 'Star', '#F59E0B', 'votes', 10),
('Community Favorite', 'Received 50+ votes across all categories', 'Heart', '#EF4444', 'votes', 50),
('Legend', 'Received 100+ votes across all categories', 'Crown', '#F59E0B', 'votes', 100),
('Top 3', 'Ranked in top 3 in any category', 'Trophy', '#F59E0B', 'rank', 3),
('Champion', 'Ranked #1 in any category', 'Medal', '#FFD700', 'rank', 1),
('Multi-Talented', 'Member of 3+ categories', 'Layers', '#8B5CF6', 'categories', 3),
('Polymath', 'Member of 5+ categories', 'Globe', '#3B82F6', 'categories', 5),
('Early Adopter', 'Joined during the first month', 'Zap', '#10B981', 'special', 0),
('Verified OG', 'Verified Twitter account', 'BadgeCheck', '#1DA1F2', 'special', 0);
