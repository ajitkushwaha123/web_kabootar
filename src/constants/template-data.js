export const templateData = {
  templates: [
    {
      name: "order_confirmation",
      parameter_format: "POSITIONAL",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "Order confirmed",
        },
        {
          type: "BODY",
          text: "Hi {{1}},\n\nThank you for your {{2}}! Your order number is {{3}}.\n\nWe'll start getting {{4}} ready to ship.\n\nEstimated delivery: {{5}} \n\nWe will let you know when your order ships.",
          example: {
            body_text: [
              [
                "John",
                "purchase",
                "#12345",
                "2 12-pack of Jasper's paper towels",
                "Jan 1, 2024",
              ],
            ],
          },
        },
        {
          type: "BUTTONS",
          buttons: [
            {
              type: "URL",
              text: "View order details",
              url: "https://ads.magicscale.in/",
            },
          ],
        },
      ],
      language: "en_US",
      status: "APPROVED",
      category: "UTILITY",
      library_template_name: "order_management_1",
      id: "816627030527071",
    },
    {
      name: "hello_world",
      parameter_format: "POSITIONAL",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "Hello World",
        },
        {
          type: "BODY",
          text: "Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.",
        },
        {
          type: "FOOTER",
          text: "WhatsApp Business Platform sample message",
        },
      ],
      language: "en_US",
      status: "APPROVED",
      category: "UTILITY",
      id: "507852021642040",
    },
    {
      name: "kravy_customer_support",
      parameter_format: "POSITIONAL",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "Hi , {{1}} !",
          example: {
            header_text: ["Ajit Kushwaha"],
          },
        },
        {
          type: "BODY",
          text: "Welcome to our customer support. How can we assist you today?",
        },
        {
          type: "FOOTER",
          text: "Kravy - Where billling meets flavour",
        },
        {
          type: "BUTTONS",
          buttons: [
            {
              type: "FLOW",
              text: "Select Issue",
              flow_id: 1811401819688531,
              flow_action: "NAVIGATE",
              navigate_screen: "DETAILS",
            },
          ],
        },
      ],
      language: "en",
      status: "APPROVED",
      category: "MARKETING",
      id: "533007989494294",
    },
    {
      name: "test_1",
      parameter_format: "POSITIONAL",
      components: [
        {
          type: "BODY",
          text: "This is a test message",
        },
      ],
      language: "en",
      status: "APPROVED",
      category: "MARKETING",
      sub_category: "CUSTOM",
      id: "532013286409742",
    },
    {
      name: "purchase_receipt_1",
      parameter_format: "POSITIONAL",
      components: [
        {
          type: "HEADER",
          format: "VIDEO",
          example: {
            header_handle: [
              "https://scontent.whatsapp.net/v/t61.29466-34/457237211_477267398079635_2630189980495008538_n.mp4?...(truncated)",
            ],
          },
        },
        {
          type: "BODY",
          text: "Thank you for your purchase of {{1}} from {{2}}. Your {{3}} PDF is attached.",
          example: {
            body_text: [
              [
                "$12.34",
                "Jasper's Market, 123 Baker street. Palo Alto CA, 91041",
                "receipt",
              ],
            ],
          },
        },
        {
          type: "FOOTER",
          text: "MAGICSCALE RESTAURANT CONSULTANCY",
        },
        {
          type: "BUTTONS",
          buttons: [
            {
              type: "PHONE_NUMBER",
              text: "Call",
              phone_number: "+918826073117",
            },
          ],
        },
      ],
      language: "en_US",
      status: "APPROVED",
      category: "UTILITY",
      sub_category: "CUSTOM",
      id: "477267394746302",
    },
  ],
  message: "Templates fetched successfully",
};
