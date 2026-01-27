export default {
  async beforeCreate(event) {
    const { data } = event.params;

    if (data.name) {
      // Regenerate slug from name using underscores
      // This overrides the default Strapi behavior or user input if they strictly want name->slug sync
      // If we only want to do this if slug is missing, check !data.slug. 
      // But user implied strictly "name to be the slug with underscores", so let's enforce it to keep them synced.
      data.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '_');       // Replace spaces with underscores
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;

    // Only update slug if name is being updated
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
    }
  },
};
