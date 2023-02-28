const capitalize = (name) =>
    name
        ? name.toLowerCase().charAt(0).toUpperCase() +
          name.slice(1).toLowerCase()
        : name;

module.exports = capitalize;
