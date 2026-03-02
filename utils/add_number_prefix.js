const addPrefixToPhoneNumber = (phoneNumber) => {
  // Strip all non-digit characters (spaces, dashes, parentheses, etc.)
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  if (digitsOnly.startsWith("255")) {
    return digitsOnly;
  } else if (digitsOnly.startsWith("0")) {
    return `255${digitsOnly.slice(1)}`;
  } else {
    // Assume local number without leading 0 — prepend 255
    return `255${digitsOnly}`;
  }
};

module.exports = addPrefixToPhoneNumber;
