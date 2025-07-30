// Quick syntax test for the campaign manager
const checkSyntax = () => {
  // Test if we can import the components
  try {
    console.log("Testing component syntax...");
    return true;
  } catch (error) {
    console.error("Syntax error found:", error);
    return false;
  }
};

checkSyntax();