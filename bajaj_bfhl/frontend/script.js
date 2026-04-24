async function send() {
  const input = document.getElementById("input").value;

  const data = input
  .replace(/[\[\]"]/g, "")   // remove brackets + quotes
  .split(",")
  .map(x => x.trim());

  try {
    const res = await fetch("http://localhost:3000/bfhl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data })
    });

    const result = await res.json();

    document.getElementById("output").innerText =
      JSON.stringify(result, null, 2);

  } catch (err) {
    document.getElementById("output").innerText = "Error calling API";
  }
}
