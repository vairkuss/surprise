class Dialogue {
    static data = JSON.parse(`

{
  "25285:0": {
    "max": { "virko": 1, "infi": 0 },
    "virko:0": [
      {
        "before": [{ "id": "infi", "pose": "smile" }],
        "replicas": [
          { "id": "virko", "pose": "wave", "text": "Привет!" },
          { "id": "virko", "pose": "show", "text": "Это тестовый диалог.", "pause": 1.8 },
          { "id": "infi", "pose": "shock", "text": "Капец, мы разговариваем  :0" }
        ],
        "choice": { "Хорошо": null, "Пока": 1 }
      },
      
      {
        "before": [{ "id": "infi", "pose": "smile" }],
        "replicas": [
          { "id": "virko", "pose": "wave", "text": "Бб братишк" },
          { "id": "infi", "pose": "wave", "text": "Пока-пока!" }
        ]
      }
    ],
    
    "virko:1": [
      {
        "replicas": [
          { "id": "virko", "pose": "show", "text": "Что-нибудь ещё?" }
        ],
        "choice": { "н": null, "дай поглажу тебя": 1 }
      },
      
      {
        "replicas": [
          { "id": "virko", "pose": "smile", "text": "г" }
        ],
        "choice":  -1
      }
    ],
    
    "infi:0": [
      {
        "replicas": [
          { "id": "infi", "pose": "smile", "text": "Мрр~? owO" }
        ],
        "choice": { "Расскажи о себе": 1, "Погладить": -1, "Я случайно": 2 }
      },
      
      {
        "replicas": [
          { "id": "infi", "pose": "tongue", "text": "Я тигр и у меня на галаве бальфые уфке! ^^" }
        ],
        "choice": { "Ещё кое-что..": 0, "Классн": null }
      },
      
      {
        "replicas": [
          { "id": "infi", "pose": "wink", "text": "Холосо" }
        ]
      }
      
    ]
  }
}

    `);

}