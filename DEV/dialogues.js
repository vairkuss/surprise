class Dialogue {
    static data = JSON.parse(`

{
  "25285:0": {
      
    "virko": [
    
      [
        {
          "before": [{ "id": "infi", "pose": "smile" }],
          "replicas": [
            { "id": "virko", "pose": "wave", "text": "Привет!" },
            { "id": "virko", "pose": "show", "text": "Это тестовый диалог.", "pause": 1.8 },
            { "id": "infi", "pose": "shock", "text": "Капец, мы разговариваем  :0" }
          ],
          "choice": { "Хорошо": null, "Пока": 1, "??": 2, "3": 3}
        },
      
        {
          "before": [{ "id": "infi", "pose": "smile" }],
          "replicas": [
            { "id": "virko", "pose": "wave", "text": "Бб братишк" },
            { "id": "infi", "pose": "wave", "text": "Пока-пока!" }
          ]
        },
      
        {
          "replicas": [
            { "id": "virko", "pose": "wave", "text": "Погоди-ка.§§.§§.§§§§\\n∆Что-то тут не так...§§§\\nЭто§ ты§ скушал§ сосиску§§§§ ∆Дениса Армянова?§§..." }
          ],
          "choice": 2
        },
      
        {
          "replicas": [
            { "id": "virko", "pose": "wave", "text": "√ГОЙДА|§ ГОЙ§×Д×А" },
            { "id": "infi", "pose": "wave", "text": "Погоди-ка.§§.§§.§§§§\\n∆Что-то тут не так...§§§\\n∆∆∆Это§ ты§ скушал§ сосиску§§§§ Дениса Армянова?§§..." }
          ],
          "choice": 3
        }
      ],
    
    
      [
        {
          "replicas": [
            { "id": "virko", "pose": "show", "text": "Что-нибудь ещё?" }
          ],
          "choice": { "н": null, "а пкжи хвостикс": 1, "г приветствие по новой, ч ты там": ["virko:0"] }
        },
      
        {
          "replicas": [
            { "id": "virko", "pose": "smile", "text": "г" }
          ],
          "choice": -2
        }
      ]
      
    ],
    
    
    "infi": [
    
      [
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
            { "id": "infi", "pose": "wink", "text": "Холосо  uwu" }
          ]
        }
      ]
      
    ]
    
  }
}

    `);
}