export function buildTemplatePayload(values) {
  const getVariableSamples = (text, type) => {
    const vars = text?.match(/{{\d+}}/g) || [];
    const sortedVars = vars
      .map((v) => parseInt(v.replace(/[{}]/g, ""), 10))
      .sort((a, b) => a - b)
      .map((num) => `{{${num}}}`);
    return sortedVars.map((v) => values?.[`${type}_sample_${v}`] || "");
  };

  const components = [];

  if (values.body) {
    const bodyComponent = {
      type: "BODY",
      text: values.body,
    };
    const samples = getVariableSamples(values.body, "body");
    if (samples.length > 0) {
      bodyComponent.example = {
        body_text: [samples],
      };
    }
    components.push(bodyComponent);
  }

  // HEADER
  if (values.header) {
    const headerComponent = {
      type: "HEADER",
      format: "TEXT",
      text: values.header,
    };
    const samples = getVariableSamples(values.header, "header");
    if (samples.length > 0) {
      headerComponent.example = {
        header_text: [samples],
      };
    }
    components.unshift(headerComponent);
  }

  // FOOTER
  if (values.footer) {
    components.push({
      type: "FOOTER",
      text: values.footer,
    });
  }

  // BUTTONS
  if (values.button) {
    components.push({
      type: "BUTTONS",
      buttons: [
        {
          type: "CATALOG",
          text: values.button,
        },
      ],
    });
  }

  return {
    name: values.name,
    language: `${values.language}`,
    category: values.category.toUpperCase(),
    components,
  };
}
