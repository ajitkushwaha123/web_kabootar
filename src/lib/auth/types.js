export class User {
  constructor({ id, email, name, imageUrl }) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.imageUrl = imageUrl;
  }
}

export class Organization {
  constructor({ id, name, slug, imageUrl }) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.imageUrl = imageUrl;
  }
}
