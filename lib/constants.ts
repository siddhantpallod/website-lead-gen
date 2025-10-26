import { Lead } from '@/types';

export const SAMPLE_LEADS: Lead[] = [
  {
    id: '1',
    businessName: 'Pacific Northwest X-Ray Inc.',
    website: 'www2.pnwx.com',
    description: 'Pacific Northwest X‑Ray Inc. is a U.S.-based supplier of x-ray and radiology equipment, protective apparel (like lead aprons), parts and accessories for medical and veterinary imaging applications.',
    issues: ['Poor Color Contrast', 'Outdated design', 'Cluttered layout'],
    status: 'new',
    lastChecked: '2 hours ago',
    draftedEmail: 'Hi there,\n\nI noticed your website at techstartsolutions.com and was impressed by your innovative approach to digital solutions. However, I spotted a few areas where we could significantly improve your online presence and user experience.\n\nYour current site has some performance issues that might be affecting your conversion rates. I\'ve created a quick prototype showing how we could modernize your design and boost your site speed by 3x.\n\nWould you be interested in a brief 15-minute call to discuss how we could help you attract more clients and grow your business?\n\nBest regards,\nTaher'
  },
  {
    id: '2',
    businessName: 'Discount Beds Belfast',
    website: 'https://www.discountbedsbelfast.co.uk/',
    description: 'Discount Beds Belfast is a family-owned business that offers a wide range of beds and mattresses at discounted prices. They are known for their quality products and customer service.',
    issues: ['Broken contact form', 'Missing SSL certificate', 'Poor SEO'],
    status: 'contacted',
    lastChecked: '1 day ago',
    draftedEmail: 'Hello,\n\nI came across Local Bakery Co. and was delighted to see your commitment to artisanal baking! Your reputation in the community is excellent, but I noticed your website might not be doing justice to your amazing products.\n\nI found some technical issues that could be preventing customers from easily ordering or contacting you. I\'ve prepared a quick redesign that would make it much easier for customers to browse your menu and place orders online.\n\nWould you like to see how we could help you reach more customers in your area?\n\nWarm regards,\nTaher'
  },
  {
    id: '3',
    businessName: 'Ash End Children Farm',
    website: 'https://ashendchildrensfarm.co.uk/',
    description: 'A lively, family-friendly children’s farm near Tamworth where kids can feed & interact with animals, enjoy tractor rides, pony sit-ons and explore an indoor play barn — all included in the entry price.',
    issues: ['Non-responsive design', 'Outdated content', 'No booking system'],
    status: 'responded',
    lastChecked: '3 days ago',
    draftedEmail: 'Hi,\n\nI was researching local gyms and found Fitness First Gym. Your facility looks amazing, but I noticed your website isn\'t showcasing your services as effectively as it could.\n\nYour current site has some usability issues that might be turning away potential members. I\'ve created a mobile-friendly version that would make it much easier for people to view your classes, book sessions, and sign up for memberships.\n\nInterested in seeing how we could help you attract more members?\n\nBest,\nTaher'
  },
  {
    id: '4',
    businessName: 'Cry Babys',
    website: 'No website',
    description: 'A vibrant downtown cocktail bar and eatery at University Ave in Gainesville known for inventive drinks, elevated comfort food and lively happy-hour energy.',
    issues: ['Poor mobile experience', 'Missing portfolio', 'No online booking'],
    status: 'new',
    lastChecked: '4 hours ago',
    draftedEmail: 'Hello,\n\nI discovered Green Earth Landscaping and was impressed by your commitment to sustainable landscaping practices. Your work looks beautiful, but your website isn\'t effectively showcasing your portfolio and services.\n\nI noticed some issues that might be preventing potential clients from easily viewing your work and requesting quotes. I\'ve prepared a modern redesign that would better highlight your expertise and make it easier for customers to contact you.\n\nWould you be interested in seeing how we could help you win more landscaping projects?\n\nRegards,\nTaher'
  }
];

export const STATUS_COLORS = {
  new: 'bg-blue-200 text-blue-900',
  contacted: 'bg-yellow-200 text-yellow-900',
  responded: 'bg-green-200 text-green-900',
  converted: 'bg-purple-200 text-purple-900'
};

export const STATUS_ORDER = {
  new: 0,
  contacted: 1,
  responded: 2,
  converted: 3
};

