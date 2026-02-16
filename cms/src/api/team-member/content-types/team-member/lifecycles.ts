const ROLE_ORDER_MAP: Record<string, number> = {
  'managing partner': 10,
  'partner': 20,
  'head of commercial banking & transaction': 30,
  'executive administrator': 40,
  'executive secretary': 50,
  'associate advocate': 60,
  'advocate': 70,
  'finance executive': 80,
  'paralegal': 90,
  'advocate trainee': 100,
  'support staff': 110,
};

const getRoleOrder = (role: string | undefined): number => {
  if (!role) return 999;
  const normalized = role.trim().toLowerCase();
  const order = ROLE_ORDER_MAP[normalized];
  
  if (!order) {
    console.warn(`[Hierarchy] Unmapped role detected: "${role}" - assigning default order 999`);
    return 999;
  }
  return order;
};

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    // 1. Handle Slug Generation
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
    }

    // 2. Handle Hierarchy Order
    data.order = getRoleOrder(data.role);
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;

    // 1. Handle Slug Generation
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
    }

    // 2. Handle Hierarchy Order
    if (data.role !== undefined) {
      data.order = getRoleOrder(data.role);
    }
  },
};
