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
    draftedEmail: 'Hi there,\n\nI came across Pacific Northwest X-Ray Inc. and was impressed by your comprehensive range of x-ray and radiology equipment. Your expertise in medical and veterinary imaging is clearly valuable, but I noticed your website could be doing more to showcase your products and attract new clients.\n\nYour current site has some design issues that might be affecting your conversion rates. I\'ve identified opportunities to improve the user experience, making it easier for medical professionals to browse your equipment and contact you for quotes.\n\nI\'ve created a prototype showing how we could modernize your design and improve the user experience. You can view it here: https://nextjs-boilerplate-1wxki3uz8-tahers-projects-b72b329e.vercel.app/\n\nWould you be interested in a brief 15-minute call to discuss how we could help you modernize your online presence and attract more healthcare clients?\n\nBest regards,\nTaher',
    prototypeLink: 'https://nextjs-boilerplate-1wxki3uz8-tahers-projects-b72b329e.vercel.app/'
  },
  {
    id: '2',
    businessName: 'Discount Beds Belfast',
    website: 'https://www.discountbedsbelfast.co.uk/',
    description: 'Discount Beds Belfast is a family-owned business that offers a wide range of beds and mattresses at discounted prices. They are known for their quality products and customer service.',
    issues: ['Broken contact form', 'Missing SSL certificate', 'Poor SEO'],
    status: 'contacted',
    lastChecked: '1 day ago',
    draftedEmail: 'Hello,\n\nI came across Discount Beds Belfast and was impressed by your family-owned business and commitment to quality beds and mattresses. Your reputation for great products and customer service is clear, but I noticed your website could be doing more to help customers find the perfect bed for their needs.\n\nI found some technical issues that could be preventing customers from easily browsing your inventory or contacting you. I\'ve prepared a quick redesign that would make it much easier for customers to explore your range and request quotes.\n\nI\'ve created a prototype showing how we could improve your website design and user experience. You can view it here: https://prototype.example.com/discountbedsbelfast\n\nWould you like to see how we could help you reach more customers in Belfast and grow your business?\n\nWarm regards,\nTaher',
    prototypeLink: 'https://prototype.example.com/discountbedsbelfast'
  },
  {
    id: '3',
    businessName: 'Ash End Children Farm',
    website: 'https://ashendchildrensfarm.co.uk/',
    description: 'A lively, family-friendly children\'s farm near Tamworth where kids can feed & interact with animals, enjoy tractor rides, pony sit-ons and explore an indoor play barn — all included in the entry price.',
    issues: ['Non-responsive design', 'Outdated content', 'No booking system'],
    status: 'responded',
    lastChecked: '3 days ago',
    draftedEmail: 'Hi,\n\nI came across Ash End Children\'s Farm and was delighted to see what a wonderful family experience you offer! Your farm sounds like such a fun place for kids to interact with animals and enjoy all the activities. However, I noticed your website isn\'t showcasing your attractions as effectively as it could.\n\nYour current site has some usability issues that might be preventing families from easily finding information about your activities, pricing, and booking visits. I\'ve created a mobile-friendly version that would make it much easier for parents to plan their visit and book tickets online.\n\nI\'ve created a prototype showing how we could improve your website design and make it more family-friendly. You can view it here: https://prototype.example.com/ashendchildrensfarm\n\nInterested in seeing how we could help you attract more families to your farm?\n\nBest,\nTaher',
    prototypeLink: 'https://prototype.example.com/ashendchildrensfarm'
  },
  {
    id: '4',
    businessName: 'Cry Babys',
    website: 'No website',
    description: 'A vibrant downtown cocktail bar and eatery at University Ave in Gainesville known for inventive drinks, elevated comfort food and lively happy-hour energy.',
    issues: ['No online presence', 'Missing digital marketing', 'No online booking system'],
    status: 'new',
    lastChecked: '4 hours ago',
    draftedEmail: 'Hello,\n\nI discovered Cry Babys and was impressed by your vibrant atmosphere and inventive drinks! Your bar has such great energy, but I noticed you don\'t have an online presence to showcase your unique offerings.\n\nI noticed some opportunities that could help you reach more customers and increase bookings. I\'ve prepared a digital strategy that would help you showcase your cocktails, promote events, and make it easier for customers to find and book your bar.\n\nI\'ve created a prototype website showing how we could establish your online presence and attract more customers. You can view it here: https://prototype.example.com/crybabys\n\nWould you be interested in seeing how we could help you attract more customers and grow your business?\n\nRegards,\nTaher',
    prototypeLink: 'https://prototype.example.com/crybabys'
  },
  {
    id: '5',
    businessName: 'Arngren Technology and Gadgets',
    website: 'arngren.net',
    description: 'Arngren Technology and Gadgets is a technology and gadget store that sells a wide range of products for the home and office.',
    issues: ['Cluttered wesbite', 'Outdates user interface', 'Redirects broken'],
    status: 'new',
    lastChecked: '4 hours ago',
    draftedEmail: 'Hello,\n\nI came across Arngren Technology and Gadgets and was impressed by your wide range of technology products for home and office. Your store seems to have great potential, but I noticed your website could be doing much more to showcase your products and attract customers.\n\nYour current site has some usability issues that might be preventing customers from easily browsing your inventory or making purchases. I\'ve identified opportunities to improve the user experience, making it easier for customers to find the right tech products for their needs.\n\nI\'ve created a prototype showing how we could modernize your website design and improve the shopping experience. You can view it here: https://prototype.example.com/arngren\n\nWould you be interested in seeing how we could help you attract more customers and increase your online sales?\n\nRegards,\nTaher',
    prototypeLink: 'https://prototype.example.com/arngren'
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