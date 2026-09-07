export const EXERCISE_CATEGORIES = {
  CHEST: 'หน้าอก (Chest)',
  BACK: 'หลัง (Back)',
  SHOULDERS: 'หัวไหล่ (Shoulders)',
  BICEPS: 'หน้าแขน (Biceps)',
  TRICEPS: 'หลังแขน (Triceps)',
  LEGS: 'ต้นขา/น่อง (Legs)',
  ABS: 'หน้าท้อง (Abs/Core)',
  FULLBODY: 'ทั่วร่างกาย (Full Body)',
  CARDIO: 'คาร์ดิโอ (Cardio)',
};

export const EQUIPMENT_TYPES = {
  BARBELL: 'Barbell',
  DUMBBELL: 'Dumbbell',
  KETTLEBELL: 'Kettlebell',
  MACHINE: 'Machine',
  CABLE: 'Cable Machine',
  BODYWEIGHT: 'Bodyweight',
  BAND: 'Resistance Band',
  ROPE: 'Battle Rope',
};

export const EXERCISE_DATABASE = [
  // ==================== 1. อกกลาง (Mid Chest) ====================
  {
    id: 'barbell-bench-press',
    name: 'Barbell Flat Bench Press',
    nameTh: 'นอนราบบนม้านั่งดันบาร์เบลอกกลาง (Barbell Flat Bench Press)',
    category: 'CHEST',
    muscle: 'Middle Sternal Pectorals (Mid Chest)',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps Brachii'],
    equipment: 'BARBELL',
    isGym: true,
    isHome: false,
    instructions: [
      'นอนราบบนม้านั่ง จับบาร์เบลกว้างกว่าช่วงไหล่เล็กน้อย ปลดล็อกบาร์เบลออกจากแร็ค',
      'หย่อนบาร์เบลลงมาสัมผัสกึ่งกลางหน้าอกเบาๆ อย่างมีควบคุม',
      'ออกแรงดันบาร์เบลขึ้นตรงเหนือหน้าอก หายใจออกขณะดันขึ้น'
    ],
    tips: 'หนีบสะบักเข้าหากัน วางเท้าแนบติดพื้นเพื่อเพิ่มความมั่นคงตลอดการดัน',
    icon: '🏋️‍♂️',
    prompt3D: {
      imagePrompt: 'Full-body side angle shot, a 3D faceless matte-grey anatomical mannequin wearing black athletic shorts, lying on a flat bench pressing a barbell upwards directly over the chest. High-precision 3D medical anatomy render where the entire middle sternal head of the pectoral muscles glows intensely in vivid neon red with electric cyan fiber lines. Solid pitch-black background, studio rim lighting, Unreal Engine 5 render, clean aesthetics, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical 9:16 video, 3D mannequin barbell flat bench press with middle sternal head of pectoral glowing in vivid neon red, pitch-black background.'
    }
  },
  {
    id: 'db-bench-press',
    name: 'Dumbbell Flat Bench Press',
    nameTh: 'นอนราบบนม้านั่งดันดัมเบลอกกลาง (DB Bench Press)',
    category: 'CHEST',
    muscle: 'Pectoralis Major (Mid Chest)',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'นอนราบบนม้านั่ง ถือดัมเบลทั้งสองข้างไว้ระดับหน้าอก ฝ่ามือหันไปทางด้านหน้า',
      'ดันดัมเบลขึ้นตรงเหนือหน้าอก แขนเหยียดเกือบตึงโดยไม่ล็อกข้อศอก',
      'ค่อยๆ ลดดัมเบลลงอย่างควบคุมจนรู้สึกตึงที่กล้ามเนื้อหน้าอก แล้วดันขึ้นซ้ำ'
    ],
    tips: 'บีบกล้ามเนื้อหน้าอกเข้าหากันที่จุดสูงสุด และรักษาหลังส่วนล่างให้อยู่ในแนวธรรมชาติ',
    icon: '🏋️‍♂️',
    prompt3D: {
      imagePrompt: 'Full-body front three-quarter view, a 3D faceless matte-grey mannequin wearing black athletic shorts, lying on a flat bench pushing two heavy dumbbells upward with arms extended. The entire pectoral major muscle group glows brightly in vibrant red with blue glowing accents across the chest plate. Pitch-black solid dark background, dramatic rim lighting, photorealistic 3D CGI render, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, 3D faceless grey mannequin performing DB Bench Press with glowing red chest contraction highlights, dark background, 4k.'
    }
  },
  {
    id: 'db-chest-fly',
    name: 'Dumbbell Chest Fly',
    nameTh: 'นอนราบบนม้านั่งกางแขนดันดัมเบลอกกลาง (Dumbbell Chest Fly)',
    category: 'CHEST',
    muscle: 'Pectoralis Major Stretch & Sternal Head',
    secondaryMuscles: ['Anterior Deltoids', 'Biceps Short Head'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'นอนราบบนม้านั่ง ถือดัมเบลไว้เหนืออก แขนเหยียดตรงและงอข้อศอกเล็กน้อย',
      'กางแขนออกด้านข้างอย่างช้าๆ โค้งเป็นวงกว้างจนรู้สึกยืดเต็มที่บริเวณอก',
      'หุบแขนกลับขึ้นมาบรรจบกันเหนือหน้าอกโดยใช้แรงบีบจากกล้ามเนื้ออก'
    ],
    tips: 'รักษาองศาข้อศอกให้คงที่ตลอดการเคลื่อนไหว อย่าเปลี่ยนท่าเป็นท่าดัน',
    icon: '🦋',
    prompt3D: {
      imagePrompt: 'Full-body top-down three-quarter angle, a 3D faceless matte-grey mannequin on a flat workout bench opening both arms wide with slight elbow bend, holding dumbbells in a fly motion. The chest pectorals are under deep stretch, glowing intensely in radiant neon red and orange. Pitch-black background, sharp anatomical details, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical 9:16 video, 3D mannequin dumbbell chest fly with radiant neon red and orange pectoral stretch glow, dark background.'
    }
  },
  {
    id: 'standing-cable-chest-fly',
    name: 'Standing Cable Chest Fly',
    nameTh: 'ยืนหนีบสายเคเบิลอกกลางรอกกลาง (Standing Cable Fly)',
    category: 'CHEST',
    muscle: 'Sternal Head Pectorals (Mid Chest)',
    secondaryMuscles: ['Anterior Deltoids', 'Core'],
    equipment: 'CABLE',
    isGym: true,
    isHome: false,
    instructions: [
      'ยืนตรงกลางเครื่องเคเบิล ปรับระดับรอกให้อยู่กึ่งกลางระดับหน้าอก จับด้ามจับทั้งสองข้าง',
      'ก้าวขาไปข้างหน้าหนึ่งก้าว โน้มตัวเล็กน้อย ดึงด้ามจับเคเบิลมาบรรจบกันด้านหน้าอก',
      'บีบกล้ามเนื้ออกกลางค้างไว้ 1 วินาที แล้วค่อยๆ ผ่อนแขนยืดกลับช้าๆ'
    ],
    tips: 'เกร็งแกนกลางลำตัวให้นิ่ง บีบอกเข้าหากันที่จุดเกร็งสุดเพื่อแรงต้านต่อเนื่อง',
    icon: '⚡',
    prompt3D: {
      imagePrompt: 'Full-body front view, a 3D faceless matte-grey anatomical mannequin wearing black athletic shorts standing tall between cable pulleys, bringing cable handles together in front of the chest. The mid-chest pectorals contract tightly, glowing with an intense bright red luminescence and neon cyan accents along the sternum. Pitch-black solid dark background, studio rim lighting, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, standing cable chest fly with mid-chest pectorals glowing bright red and neon cyan accents, pitch-black background.'
    }
  },
  {
    id: 'kettlebell-floor-press',
    name: 'Kettlebell Floor Press',
    nameTh: 'นอนดันเคทเทิลเบลบนพื้น (Kettlebell Floor Press)',
    category: 'CHEST',
    muscle: 'Middle Pectorals & Triceps Lockout',
    secondaryMuscles: ['Triceps Brachii', 'Anterior Deltoids'],
    equipment: 'KETTLEBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'นอนราบกับพื้น ถือเคทเทิลเบลด้วยมือทั้งสองข้าง งอเข่าตั้งเท้าบนพื้น',
      'ดันเคทเทิลเบลขึ้นตรงเหนือหน้าอกจนแขนเหยียดตึง',
      'ลดเคทเทิลเบลลงมาจนท่อนแขนด้านหลังสัมผัสพื้นเบาๆ แล้วดันขึ้นซ้ำ'
    ],
    tips: 'การทำบนพื้นช่วยเซฟไหล่และจำกัดระยะลง ป้องกันอาการบาดเจ็บที่ข้อต่อไหล่',
    icon: '🔔',
    prompt3D: {
      imagePrompt: 'Full-body shot, a 3D faceless matte-grey mannequin lying flat on a dark workout mat on the floor, pressing two kettlebells straight up over the chest. Middle chest muscles illuminated with a brilliant glowing red and blue anatomical overlay. No bench, clean floor setting, pitch-black background, Unreal Engine 5, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, 3D mannequin kettlebell floor press with glowing red and blue middle chest overlay, dark background.'
    }
  },

  // ==================== 2. อกบน (Upper Chest) ====================
  {
    id: 'incline-barbell-press',
    name: 'Incline Barbell Bench Press',
    nameTh: 'ดันบาร์เบลม้านั่งปรับเอียงอกบน (Incline Barbell Press)',
    category: 'CHEST',
    muscle: 'Clavicular Head (Upper Chest)',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    equipment: 'BARBELL',
    isGym: true,
    isHome: false,
    instructions: [
      'ปรับม้านั่งเอียงประมาณ 30-45 องศา นอนราบจับบาร์เบลกว้างกว่าช่วงไหล่เล็กน้อย',
      'ยกบาร์เบลออกจากแร็ค ลดบาร์เบลลงมาที่บริเวณกระดูกไหปลาร้าหรืออกส่วนบนช้าๆ',
      'ดันบาร์เบลขึ้นตรงจนแขนเกือบตึง หายใจออกขณะออกแรงดัน'
    ],
    tips: 'ไม่ควรปรับเบาะชันเกิน 45 องศา เพื่อไม่ให้น้ำหนักตกไปที่หัวไหล่หน้ามากเกินไป',
    icon: '🏋️‍♂️',
    prompt3D: {
      imagePrompt: 'Full-body shot, a 3D faceless matte-grey mannequin wearing black athletic shorts on a 45-degree incline bench, pressing a barbell upward. Accurate medical anatomy render where ONLY the clavicular head (upper chest muscles directly below the collarbone) glows intensely in vivid neon red and cyan, clearly separated from the mid-chest. Solid pitch-black background, high-contrast rim lighting, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, 3D mannequin incline bench pressing barbell with upper chest glowing red and blue, 4k 60fps.'
    }
  },
  {
    id: 'incline-db-bench-press',
    name: 'Incline Dumbbell Bench Press',
    nameTh: 'ดันดัมเบลม้านั่งปรับเอียงอกบน (Incline DB Bench Press)',
    category: 'CHEST',
    muscle: 'Clavicular Pectoralis (Upper Chest)',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'ปรับม้านั่งเอียง 30-45 องศา นอนพิงเบาะ ถือดัมเบลสองข้างระดับอกส่วนบน',
      'ดันดัมเบลขึ้นตรงสวิงเข้าหากันเล็กน้อยที่จุดสูงสุดเหนืออกบน',
      'ลดดัมเบลลงอย่างควบคุมจนรู้สึกยืดที่อกส่วนบนแล้วดันขึ้นซ้ำ'
    ],
    tips: 'รักษาตำแหน่งข้อศอกให้ทำมุม 45 องศากับลำตัว ไม่กางข้อศอกออกมากเกินไป',
    icon: '🏋️‍♂️',
    prompt3D: {
      imagePrompt: 'Full-body front three-quarter view, a 3D faceless matte-grey mannequin on a 30-to-45-degree incline bench pushing two dumbbells toward the ceiling. The upper chest (clavicular pectoralis) glows with a bright red-orange holographic energy effect, contracting at the top. Pitch-black dark mode background, studio lighting, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, 3D mannequin incline dumbbell press with upper chest glowing red-orange holographic energy, 4k.'
    }
  },
  {
    id: 'incline-db-fly',
    name: 'Incline Dumbbell Fly',
    nameTh: 'กางแขนดันดัมเบลม้านั่งปรับเอียงอกบน (Incline DB Fly)',
    category: 'CHEST',
    muscle: 'Upper Pectoral Fibers (Upper Chest Stretch)',
    secondaryMuscles: ['Anterior Deltoids', 'Biceps'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'นอนบนม้านั่งปรับเอียง 30-45 องศา ถือดัมเบลขึ้นเหนืออกบน งอศอกเล็กน้อย',
      'กางแขนออกด้านข้างเป็นวงกว้างจนรู้สึกยืดเต็มที่บริเวณอกส่วนบน',
      'ใช้แรงเกร็งจากอกส่วนบนหุบแขนกลับขึ้นสู่จุดเริ่มต้น'
    ],
    tips: 'เน้นจังหวะผ่อนลงช้าๆ เพื่อยืดเส้นใยกล้ามเนื้ออกบนเต็มประสิทธิภาพ',
    icon: '🦋',
    prompt3D: {
      imagePrompt: 'Full-body side angle, a 3D faceless matte-grey mannequin lying on an incline bench with arms spread wide holding dumbbells, elbows slightly curved. Upper pectoral fibers illuminate in glowing bright red under intense eccentric stretch. Solid black void background, clean 3D render, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, incline dumbbell fly with glowing bright red upper pectoral fibers under stretch, black void background.'
    }
  },
  {
    id: 'low-to-high-cable-fly',
    name: 'Low-to-High Cable Fly',
    nameTh: 'ดึงสายเคเบิลจากล่างขึ้นบนเน้นอกบน (Low-to-High Cable Fly)',
    category: 'CHEST',
    muscle: 'Upper Clavicular Pectorals (Upper Chest)',
    secondaryMuscles: ['Anterior Deltoids', 'Core'],
    equipment: 'CABLE',
    isGym: true,
    isHome: false,
    instructions: [
      'ปรับรอกเคเบิลให้อยู่ระดับล่างสุด จับด้ามจับขึ้นมา ยืนตรงกลางก้าวขาไปข้างหน้า',
      'ดึงด้ามจับเคเบิลเฉียงขึ้นด้านบนจนมาบรรจบกันระดับสายตาหรือหน้าผาก',
      'เกร็งอกบนค้างไว้ที่จุดสูงสุด 1 วินาที แล้วค่อยๆ ผ่อนลง'
    ],
    tips: 'จังหวะดึงขึ้นให้จินตนาการว่ากำลังโอบกอดต้นไม้ขึ้นด้านบนเพื่อเน้นรอยหยักอกบน',
    icon: '⚡',
    prompt3D: {
      imagePrompt: 'Full-body front shot, a 3D faceless matte-grey mannequin standing upright, pulling two low cable handles diagonally upward to eye level. The upper chest muscles glow vividly in electric cyan and bright red, emphasizing the upward contraction. Pitch-black solid background, cinematic rim lighting, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, low to high cable fly with upper chest muscles glowing electric cyan and bright red, pitch-black background.'
    }
  },

  // ==================== 3. อกล่าง (Lower Chest) ====================
  {
    id: 'high-to-low-cable-fly',
    name: 'High-to-Low Cable Fly',
    nameTh: 'ดึงสายเคเบิลจากบนลงล่างเน้นอกล่าง (High-to-Low Cable Fly)',
    category: 'CHEST',
    muscle: 'Abdominal Head Pectorals (Lower Chest Line)',
    secondaryMuscles: ['Lower Pectorals', 'Anterior Deltoids'],
    equipment: 'CABLE',
    isGym: true,
    isHome: false,
    instructions: [
      'ปรับรอกเคเบิลอยู่ตำแหน่งสูง ยืนตรงกลางก้าวขาไปข้างหน้า โน้มตัวเล็กน้อย',
      'ดึงด้ามจับเคเบิลเฉียงลงด้านล่างไปบรรจบกันระดับหน้าท้องหรือเอว',
      'เกร็งกล้ามเนื้ออกล่างค้างไว้ แล้วค่อยๆ คลายแขนกลับขึ้นด้านบน'
    ],
    tips: 'ดึงลงให้ตัดผ่านเส้นขอบอกล่าง ช่วยสร้างขอบอกล่างที่คมชัด',
    icon: '⚡',
    prompt3D: {
      imagePrompt: 'Full-body front three-quarter shot, a 3D faceless matte-grey mannequin wearing black shorts standing slightly leaned forward, pulling cable handles from a high pulley downward toward the waistline. The lower abdominal head of the pectoral muscles (lower chest line) glows sharply in neon red and blue, highlighting lower chest definition. Pitch-black dark studio background, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, high to low cable fly with lower chest line glowing in neon red and blue, dark studio background.'
    }
  },
  {
    id: 'decline-db-press',
    name: 'Decline Dumbbell Press',
    nameTh: 'นอนม้านั่งหัวต่ำดันดัมเบลอกล่าง (Decline DB Press)',
    category: 'CHEST',
    muscle: 'Lower Pectoral Margin (Lower Chest)',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'นอนบนม้านั่งปรับระดับหัวต่ำ (Decline Bench) ล็อกขาให้แน่น ถือถือดัมเบลสองข้าง',
      'ดันดัมเบลขึ้นตรงเหนืออกล่าง แขนเหยียดเกือบตึง',
      'ลดดัมเบลลงอย่างควบคุมจนรู้สึกยืดบริเวณขอบอกล่าง แล้วดันขึ้นซ้ำ'
    ],
    tips: 'เกร็งหน้าท้องและล็อกขาให้มั่นคง ป้องกันตัวลื่นหลุดจากม้านั่งหัวต่ำ',
    icon: '🏋️‍♂️',
    prompt3D: {
      imagePrompt: 'Full-body shot, a 3D faceless matte-grey mannequin on a decline workout bench with legs hooked, pressing dumbbells upward. The lower chest margin glows brightly with a vibrant red-orange highlight, showing peak contraction. Solid pitch-black background, medical CGI precision, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, decline dumbbell press with lower chest glowing in red-orange highlight, pitch-black background.'
    }
  },
  {
    id: 'incline-push-up',
    name: 'Incline Push-Up (Bench)',
    nameTh: 'ดันพื้นมือวางบนม้านั่งเน้นอกล่าง (Incline Push-Up)',
    category: 'CHEST',
    muscle: 'Lower Pectorals & Core',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    equipment: 'BODYWEIGHT',
    isGym: true,
    isHome: true,
    instructions: [
      'วางมือทั้งสองข้างบนม้านั่งหรือขอบโต๊ะ ถอยเท้ายืดตัวตรงในท่าแพลงก์',
      'งอข้อศอกลดลำตัวลงมาจนกระทั่งหน้าอกแตะขอบม้านั่งเบาๆ',
      'ออกแรงดันลำตัวกลับขึ้นสู่ตำแหน่งเริ่มต้น'
    ],
    tips: 'ท่านี้ช่วยลดภาระน้ำหนัก เหมาะสำหรับมือใหม่หรือใช้ปั๊มอกล่างปิดท้ายวันเล่นอก',
    icon: '🪵',
    prompt3D: {
      imagePrompt: 'Full-body horizontal side view, a 3D faceless matte-grey mannequin in a straight push-up plank position with both hands placed on a flat workout bench. The lower chest pectorals glow in intense neon red as the body pushes upward. No gym machines, pitch-black background, clean studio lighting, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, incline push-up on workout bench with glowing neon red lower chest pectorals, pitch-black background.'
    }
  },

  // ==================== 4. อกใน และ ขยายทรวงอก (Inner Chest & Expansion) ====================
  {
    id: 'hex-press',
    name: 'Dumbbell Squeeze Press (Hex Press)',
    nameTh: 'หนีบดัมเบลสองข้างดันอกใน (Hex Squeeze Press)',
    category: 'CHEST',
    muscle: 'Sternal Inner Chest Cleavage',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'นอนราบบนม้านั่ง ถือดัมเบลทรงหกเหลี่ยมสองข้างกดแนบติดกันแน่นๆ กลางหน้าอก',
      'ดันดัมเบลขึ้นตรงพร้อมกับออกแรงบีบดัมเบลทั้งสองข้างเข้าหากันตลอดเวลา',
      'ลดดัมเบลลงมาสัมผัสหน้าอกกลาง โดยยังคงออกแรงบีบหนีบดัมเบลไม่ให้แยกจากกัน'
    ],
    tips: 'หัวใจสำคัญคือแรงหนีบเข้าหากันตลอดการเคลื่อนไหว เพื่อสร้างร่องอกกลางให้ลึกหนา',
    icon: '🧱',
    prompt3D: {
      imagePrompt: 'Full-body front angle, a 3D faceless matte-grey mannequin on a flat bench pressing two hexagonal dumbbells clamped tightly together against each other above the center of the chest. The inner chest cleavage and sternal pectoral fibers glow intensely in a dense neon blue and burning red line. Pitch-black solid background, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, hex press with inner chest cleavage glowing in neon blue and burning red line, pitch-black background.'
    }
  },
  {
    id: 'db-pullover',
    name: 'Dumbbell Pullover',
    nameTh: 'นอนขวางม้านั่งยืดดัมเบลข้ามศีรษะขยายทรวงอก (Dumbbell Pullover)',
    category: 'CHEST',
    muscle: 'Serratus Anterior, Upper Chest & Ribcage Expansion',
    secondaryMuscles: ['Latissimus Dorsi', 'Triceps Long Head'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'นอนขวางม้านั่ง ให้หลังส่วนบนวางบนเบาะ วางเท้าติดพื้น วางสะโพกลดต่ำลงเล็กน้อย',
      'ถือดัมเบลหนึ่งลูกด้วยมือสองข้างขนานกับอก หย่อนดัมเบลข้ามศีรษะลงช้าๆ จนยืดอกและโครงซี่โครง',
      'ดึงดัมเบลย้อนกลับมาที่ตำแหน่งเหนืออกโดยใช้แรงเกร็งจากอกและฟันเลื่อย (Serratus)'
    ],
    tips: 'หย่อนดัมเบลลงให้ยืดโครงซี่โครงและอกเต็มที่ ช่วยเปิดขยายทรวงอกให้กว้างขึ้น',
    icon: '🎈',
    prompt3D: {
      imagePrompt: 'Full-body side profile, a 3D faceless matte-grey mannequin lying perpendicular across a flat bench, holding a single dumbbell overhead in a deep stretch behind the head. Entire chest cage, upper pectorals, and serratus anterior glow in vibrant red and neon yellow to visualize ribcage expansion and muscle stretch. Pitch-black dark background, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, dumbbell pullover with chest cage and serratus glowing in vibrant red and neon yellow, dark background.'
    }
  },
  {
    id: 'tricep-pushdown',
    name: 'Cable Triceps Pushdown',
    nameTh: 'ดึงสายเคเบิลกดลงเน้นหลังแขน (Cable Triceps Pushdown)',
    category: 'TRICEPS',
    muscle: 'Triceps Brachii',
    secondaryMuscles: ['Forearms'],
    equipment: 'CABLE',
    isGym: true,
    isHome: false,
    instructions: [
      'ยืนตัวตรงหรือโน้มตัวไปข้างหน้าเล็กน้อย จับบาร์ตรงหรือเชือกของเครื่องเคเบิลระดับอก',
      'หนีบข้อศอกทั้งสองข้างให้อยู่ข้างลำตัวคงที่ ไม่ขยับข้อศอกไปมา',
      'กดมือลงจนแขนเหยียดตรง เกร็งกล้ามเนื้อหลังแขนค้างไว้ 1 วินาที แล้วปล่อยกลับช้าๆ'
    ],
    tips: 'ล็อกข้อศอกให้อยู่นิ่ง ให้เคลื่อนไหวเฉพาะข้อต่อข้อศอกเท่านั้นเพื่อโฟกัสหลังแขนเต็มที่',
    icon: '💪',
    prompt3D: {
      imagePrompt: 'Full-body shot from the side, a 3D faceless grey anatomical mannequin standing upright at a cable machine pushing a straight bar downward. Triceps muscle group lights up with a glowing neon blue and red overlay. Solid dark black background, clean anatomical CGI visualization, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video of 3D mannequin performing cable triceps pushdown with electric glowing red and blue triceps, 4k.'
    }
  },
  {
    id: 'overhead-db-extension',
    name: 'Overhead DB Extension',
    nameTh: 'นั่งยกดัมเบลข้ามศีรษะฝึกหลังแขน (Overhead DB Extension)',
    category: 'TRICEPS',
    muscle: 'Triceps Long Head',
    secondaryMuscles: ['Core Stability'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'นั่งบนม้านั่ง ถือดัมเบลด้วยมือทั้งสองข้างยกขึ้นเหนือศีรษะ แขนเหยียดตรง',
      'งอข้อศอกหย่อนดัมเบลลงไปด้านหลังศีรษะอย่างช้าๆ จนรู้สึกยืดที่หลังแขน',
      'เหยียดแขนดันดัมเบลกลับขึ้นสู่ตำแหน่งเริ่มต้นเหนือศีรษะ'
    ],
    tips: 'เกร็งหน้าท้องและพยายามหนีบข้อศอกไม่ให้กางออกด้านข้างมากเกินไป',
    icon: '💪',
    prompt3D: {
      imagePrompt: 'Full-body shot, a 3D faceless grey mannequin seated on a flat bench holding a dumbbell overhead with both hands, elbows bent backward. Triceps muscles glowing in vivid red highlight. Dark void background, cinematic lighting, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical 3D video, mannequin performing seated overhead dumbbell triceps extension with glowing red triceps long head, 4k.'
    }
  },

  // ==================== ท่ากลุ่ม Pull (หลัง / หน้าแขน) ====================
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    nameTh: 'ดึงบาร์กว้างลงสร้างปีกหลัง (Lat Pulldown)',
    category: 'BACK',
    muscle: 'Latissimus Dorsi & Teres Major',
    secondaryMuscles: ['Biceps', 'Rhomboids', 'Posterior Deltoids'],
    equipment: 'CABLE',
    isGym: true,
    isHome: false,
    instructions: [
      'นั่งบนเครื่อง Lat Pulldown ปรับเบาะล็อกขาให้กระชับ จับบาร์กว้างกว่าช่วงไหล่',
      'แอ่นอกเล็กน้อย ดึงบาร์ลงมาสู่ระดับกระดูกไหปลาร้าหรือหน้าอกส่วนบน',
      'เกร็งกล้ามเนื้อปีกหลัง (Lats) ค้างไว้ 1 วินาที แล้วปล่อยบาร์กลับขึ้นอย่างช้าๆ'
    ],
    tips: 'ใช้ข้อศอกเป็นตัวนำทางดึงลง อย่าใช้แรงเหวี่ยงจากลำตัว',
    icon: '🦅',
    prompt3D: {
      imagePrompt: 'Full-body rear view, a 3D faceless grey anatomical mannequin seated at a pulldown machine pulling a wide bar to the upper chest. Latissimus dorsi and teres major muscles glow with a brilliant red-orange highlight overlay. Pitch black background, 3D anatomical render, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical 3D video, rear view of mannequin lat pulldown with glowing orange-red lats activating under tension, 4k.'
    }
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    nameTh: 'นั่งดึงเคเบิลสร้างความหนากลางหลัง (Seated Cable Row)',
    category: 'BACK',
    muscle: 'Mid-Back Rhomboids & Trapezius',
    secondaryMuscles: ['Latissimus Dorsi', 'Biceps', 'Erector Spinae'],
    equipment: 'CABLE',
    isGym: true,
    isHome: false,
    instructions: [
      'นั่งบนแท่นวางเท้า งอเข่าเล็กน้อย จับด้ามจับเคเบิล ลำตัวตั้งตรง อกผาย',
      'ดึงด้ามจับเข้ามาหากึ่งกลางลำตัวระดับสะดือ พร้อมหนีบสะบักเข้าหากันแน่นๆ',
      'ค่อยๆ ผ่อนแขนยืดตัวกลับไปข้างหน้าจนหลังยืดตัวเต็มที่'
    ],
    tips: 'หลีกเลี่ยงการโยกตัวไปมา โฟกัสการบีบสะบักด้านหลัง (Retract Scapula)',
    icon: '🚣',
    prompt3D: {
      imagePrompt: 'Full-body shot from a three-quarters back angle, a 3D faceless grey mannequin seated on the floor pulling a cable handle toward the navel. Mid-back rhomboids, lower lats, and trapezius muscles glow with a vibrant red and blue highlight. Deep black background, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, three-quarters angle 3D mannequin seated cable row with pulsating neon red back muscles, 4k.'
    }
  },
  {
    id: 'chest-supported-db-row',
    name: 'Chest-Supported DB Row',
    nameTh: 'นอนคว่ำบนเบาะเอียงดึงดัมเบล (Chest-Supported DB Row)',
    category: 'BACK',
    muscle: 'Rhomboids & Latissimus Dorsi',
    secondaryMuscles: ['Rear Deltoids', 'Biceps'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'ปรับม้านั่งเอียง 30-45 องศา นอนคว่ำให้อกแนบติดเบาะ ถือดัมเบลไว้ทั้งสองข้าง',
      'ดึงดัมเบลขึ้นข้างลำตัวโดยเน้นการยกข้อศอกขึ้นและบีบสะบักหลัง',
      'ค้างไว้ที่จุดสูงสุด 1 วินาที แล้วลดดัมเบลลงอย่างช้าๆ'
    ],
    tips: 'การมีเบาะรองอกช่วยตัดแรงเหวี่ยงจากเอวและหลังล่าง ทำให้กล้ามเนื้อหลังทำงาน 100%',
    icon: '🛡️',
    prompt3D: {
      imagePrompt: 'Full-body side profile, a 3D faceless grey mannequin lying face down on an incline bench rowing dumbbells upwards. Rhomboids and latissimus dorsi highlighted with bright glowing red muscles. Pitch black background, hyper-detailed 3D render, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, side angle mannequin chest supported dumbbell row with glowing red back musculature, 4k.'
    }
  },
  {
    id: 'barbell-curl',
    name: 'Barbell Biceps Curl',
    nameTh: 'ยืนยกบาร์เบลฝึกกล้ามแขนด้านหน้า (Barbell Biceps Curl)',
    category: 'BICEPS',
    muscle: 'Biceps Brachii',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'BARBELL',
    isGym: true,
    isHome: false,
    instructions: [
      'ยืนตรง แยกเท้าเท่าช่วงไหล่ จับบาร์เบลหงายมือความกว้างเท่าช่วงไหล่',
      'หนีบข้อศอกไว้ข้างลำตัว ม้วนบาร์เบลขึ้นมาข้างหน้าโดยใช้แรงจากกล้ามเนื้อหน้าแขน',
      'บีบกล้ามเนื้อหน้าแขนที่จุดสูงสุด แล้วค่อยๆ ผ่อนบาร์เบลลงช้าๆ จนสุดแขน'
    ],
    tips: 'ห้ามโยกลำตัวหรือใช้แรงเหวี่ยงจากสะโพก ล็อกข้อศอกให้อยู่กับที่ตลอดการฝึก',
    icon: '💪',
    prompt3D: {
      imagePrompt: 'Full-body front view, a 3D faceless grey anatomical mannequin standing tall curling a barbell upward. Biceps brachii muscles prominently glow in bright red with blue fiber accents. Solid black background, studio rim lighting, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical 3D render, mannequin curling barbell with high-voltage glowing red biceps brachii, 4k 60fps.'
    }
  },
  {
    id: 'db-hammer-curl',
    name: 'DB Hammer Curl',
    nameTh: 'ยืนยกดัมเบลจับแบบค้อน (DB Hammer Curl)',
    category: 'BICEPS',
    muscle: 'Brachialis & Brachioradialis',
    secondaryMuscles: ['Biceps Brachii', 'Forearms'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'ยืนตรงถือดัมเบลทั้งสองข้างในลักษณะจับแบบค้อน (ฝ่ามือหันเข้าหากัน)',
      'ยกดัมเบลขึ้นมาพร้อมกันหรือสลับข้าง โดยรักษาฝ่ามือให้หันเข้าหากันตลอด',
      'ยกขึ้นจนเกร็งเต็มที่ แล้วลดดัมเบลลงอย่างช้าๆ ควบคุมการเคลื่อนไหว'
    ],
    tips: 'ท่านี้ช่วยสร้างความหนาของแขนท่อนบนและท่อนแขนด้านล่าง (Forearm) ได้อย่างยอดเยี่ยม',
    icon: '🔨',
    prompt3D: {
      imagePrompt: 'Full-body view, a 3D faceless grey mannequin standing holding dumbbells in a neutral grip, curling upward. Brachialis and forearm brachioradialis muscles illuminated with glowing neon cyan and red highlights. Solid black background, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, 3D mannequin performing neutral hammer curls with cyan-red forearm and brachialis glow, 4k.'
    }
  },

  // ==================== ท่ากลุ่ม Shoulders & Core (ไหล่ / ท้อง) ====================
  {
    id: 'seated-db-shoulder-press',
    name: 'Seated DB Shoulder Press',
    nameTh: 'นั่งดันดัมเบลขึ้นเหนือศีรษะฝึกหัวไหล่ (Seated DB Shoulder Press)',
    category: 'SHOULDERS',
    muscle: 'Deltoids (Anterior, Lateral, Posterior)',
    secondaryMuscles: ['Triceps', 'Upper Trapezius'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'นั่งบนม้านั่งพนักพิงตั้งตรง ถือดัมเบลระดับหัวไหล่ ฝ่ามือหันไปด้านหน้า',
      'ดันดัมเบลขึ้นตรงเหนือศีรษะจนแขนเกือบตึง ระวังไม่ให้ดัมเบลชนกันด้านบน',
      'ค่อยๆ ลดดัมเบลลงมาที่ระดับใบหูหรือหัวไหล่ แล้วดันขึ้นซ้ำ'
    ],
    tips: 'เกร็งกล้ามเนื้อแกนกลางลำตัวตลอดเวลา และไม่แอ่นหลังส่วนล่างมากเกินไป',
    icon: '🎯',
    prompt3D: {
      imagePrompt: 'Full-body front shot, a 3D faceless grey anatomical mannequin seated upright pressing dumbbells directly overhead. All three heads of the deltoids glow in vivid red and neon blue. Solid pitch black background, clean CGI aesthetic, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, front angle 3D mannequin seated dumbbell shoulder press with glowing deltoid cap highlights, 4k.'
    }
  },
  {
    id: 'lateral-raise',
    name: 'DB Lateral Raise',
    nameTh: 'ยืนกางแขนยกดัมเบลสร้างหัวไหล่ข้าง (DB Lateral Raise)',
    category: 'SHOULDERS',
    muscle: 'Lateral Deltoids',
    secondaryMuscles: ['Trapezius', 'Anterior Deltoids'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'ยืนตรงแยกเท้าเท่าสะโพก ถือดัมเบลไว้ข้างลำตัว งอข้อศอกเล็กน้อย',
      'ยกแขนกางออกด้านข้างจนกระทั่งดัมเบลอยู่ในระดับเสมอหัวไหล่',
      'ค้างไว้เสี้ยววินาที แล้วค่อยๆ ลดแขนลงช้าๆ ต้านแรงโน้มถ่วง'
    ],
    tips: 'คิดว่ากำลังเทน้ำออกจากเหยือกที่จุดสูงสุดเพื่อโฟกัสหัวไหล่ด้านข้างอย่างแท้จริง',
    icon: '🦅',
    prompt3D: {
      imagePrompt: 'Full-body front view, a 3D faceless grey mannequin standing with arms raised to shoulder level holding dumbbells. Lateral deltoid muscles highlighted with an intense glowing red overlay. Deep black background, dramatic side rim light, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, mannequin dumbbell lateral raise with glowing red lateral deltoids, studio lighting, 4k.'
    }
  },
  {
    id: 'rear-delt-fly',
    name: 'Chest-Supported Rear Fly',
    nameTh: 'นอนคว่ำบนเบาะเอียงกางแขนฝึกไหล่หลัง (Chest-Supported Rear Fly)',
    category: 'SHOULDERS',
    muscle: 'Posterior (Rear) Deltoids',
    secondaryMuscles: ['Rhomboids', 'Mid Trapezius'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'ปรับเบาะเอียง 30-45 องศา นอนคว่ำอกแนบเบาะ ถือดัมเบลน้ำหนักเบาห้อยลง',
      'กางแขนออกด้านข้างและขึ้นด้านบนโดยงอข้อศอกเล็กน้อย โฟกัสแรงที่ด้านหลังของหัวไหล่',
      'บีบกล้ามเนื้อไหล่หลังที่จุดสูงสุด แล้วค่อยๆ ลดแขนลง'
    ],
    tips: 'ใช้น้ำหนักเบาแต่เน้นโฟกัส อย่าใช้แรงเหวี่ยง เพื่อให้กล้ามเนื้อไหล่หลังทำงานเต็มที่',
    icon: '🦋',
    prompt3D: {
      imagePrompt: 'Full-body shot, a 3D faceless matte-grey anatomical mannequin lying prone (chest down) on a 45-degree incline workout bench, wearing black athletic shorts. The mannequin is holding a pair of dumbbells, elbows slightly bent, performing a reverse fly movement. High-contrast medical 3D anatomy render where specifically the posterior deltoids (the back head of the shoulder muscles, rear shoulders) glow intensely in vivid neon red and cyan blue, distinctly highlighting the rear delts and NOT the upper back or shoulder blades. Pitch-black solid dark background, studio rim lighting, Unreal Engine 5 render style, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical 9:16 4k video, a 3D faceless matte-grey anatomical mannequin lying prone on a 45-degree incline bench performing dumbbell reverse fly with intense glowing neon red and cyan blue posterior deltoids, pitch-black background.'
    }
  },
  {
    id: 'front-raise',
    name: 'Standing DB Front Raise',
    nameTh: 'ยืนยกดัมเบลไปด้านหน้าฝึกไหล่หน้า (Standing DB Front Raise)',
    category: 'SHOULDERS',
    muscle: 'Anterior (Front) Deltoids',
    secondaryMuscles: ['Lateral Deltoids', 'Upper Pectorals', 'Trapezius'],
    equipment: 'DUMBBELL',
    isGym: true,
    isHome: true,
    instructions: [
      'ยืนตัวตรง แยกเท้ากว้างระดับสะโพก ถือดัมเบลทั้งสองข้างไว้ด้านหน้าต้นขา ฝ่ามือคว่ำหันเข้าหาตัว',
      'ยกดัมเบลขึ้นตรงไปด้านหน้าอย่างช้าๆ โดยรักษาแขนให้เกือบตึง (งอศอกเพียงเล็กน้อย)',
      'ยกขึ้นจนกระทั่งดัมเบลอยู่ในระดับเสมอหัวไหล่หรือสายตา เกร็งกล้ามเนื้อหัวไหล่หน้าค้างไว้เสี้ยววินาที',
      'ค่อยๆ ลดดัมเบลลงสู่ตำแหน่งเริ่มต้นอย่างควบคุม ต้านแรงโน้มถ่วง'
    ],
    tips: 'รักษาลำตัวให้นิ่ง ไม่โยกตัวหรือใช้แรงเหวี่ยงจากสะโพกเพื่อส่งแรง',
    icon: '🔱',
    prompt3D: {
      imagePrompt: 'Full-body front view, a 3D faceless matte-grey anatomical mannequin standing tall wearing black athletic shorts, raising a pair of dumbbells straight forward to shoulder height. Anterior deltoids (front shoulder caps) glow intensely in vivid neon red, with cyan blue rim lighting on arms and neck. Solid black studio background, clean rim lighting, Unreal Engine 5 render style, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical 9:16 4k video, mannequin standing dumbbell front raise with glowing neon red anterior deltoids, studio dark background.'
    }
  },
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    nameTh: 'คุกเข่าดึงสายเคเบิลม้วนหน้าท้อง (Cable Crunch)',
    category: 'ABS',
    muscle: 'Rectus Abdominis (Six Pack)',
    secondaryMuscles: ['Obliques'],
    equipment: 'CABLE',
    isGym: true,
    isHome: false,
    instructions: [
      'คุกเข่าหน้าเครื่องเคเบิล จับสายเชือกไว้ข้างศีรษะระดับขมับหรือใบหู',
      'ม้วนลำตัวลง โค้งหลังและดึงข้อศอกลงไปหาหัวเข่าโดยใช้การเกร็งกล้ามเนื้อหน้าท้อง',
      'เกร็งหน้าท้องค้างไว้ 1 วินาที แล้วค่อยๆ ยืดตัวกลับขึ้นช้าๆ'
    ],
    tips: 'ล็อกสะโพกให้อยู่กับที่ อย่าขยับสะโพกไปมา ให้เคลื่อนไหวด้วยการม้วนตัวของกระดูกสันหลัง',
    icon: '🍫',
    prompt3D: {
      imagePrompt: 'Full-body side shot, a 3D faceless grey mannequin kneeling holding a cable rope behind the neck, curling the torso forward. Rectus abdominis muscles glowing with a vibrant yellow-orange and red overlay. Solid dark background, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, side angle kneeling cable crunch with glowing abs muscle contraction, 4k.'
    }
  },
  {
    id: 'plank',
    name: 'Plank',
    nameTh: 'แพลงก์เกร็งแกนกลางลำตัว (Forearm Plank)',
    category: 'ABS',
    muscle: 'Core & Rectus Abdominis',
    secondaryMuscles: ['Obliques', 'Lower Back', 'Glutes'],
    equipment: 'BODYWEIGHT',
    isGym: true,
    isHome: true,
    instructions: [
      'นอนคว่ำ วางท่อนแขนบนพื้นตั้งฉากกับหัวไหล่ ปลายเท้ายันพื้น',
      'ยกลำตัวขึ้นให้เป็นเส้นตรงตั้งแต่ศีรษะจรดส้นเท้า เกร็งหน้าท้องและก้น',
      'หายใจเข้า-ออกสม่ำเสมอ ค้างท่าไว้ตามเวลาที่กำหนด'
    ],
    tips: 'อย่าปล่อยให้สะโพกตกหรือโก่งก้นขึ้นสูง ลำตัวต้องตรงขนานกับพื้นเสมอ',
    icon: '🪵',
    prompt3D: {
      imagePrompt: 'Full-body horizontal side view, a 3D faceless matte-grey anatomical mannequin holding a standard prone forearm plank exercise on a black gym mat on the floor. Body forms a completely straight horizontal line from head to heels, elbows bent at 90 degrees resting on the mat, toes on the ground. No gym machines, no cables, no pulleys. The entire abdominal rectus and core obliques are highlighted with an intense glowing golden-yellow and bright red overlay showing isometric muscle tension. Solid pitch-black dark studio background, clean rim lighting, medical 3D CGI render, Unreal Engine 5, 2k resolution, aspect ratio 16:9.',
      videoPrompt: 'Horizontal 16:9 4k video, 3D faceless matte-grey anatomical mannequin holding perfect forearm plank with glowing golden-yellow and bright red isometric core contraction, pitch-black background.'
    }
  },

  // ==================== ท่ากลุ่ม Cardio (คาร์ดิโอ) ====================
  {
    id: 'battle-rope',
    name: 'Battle Rope',
    nameTh: 'สะบัดเชือกแบทเทิลโรปคาร์ดิโอขั้นสุด (Battle Rope Waves)',
    category: 'CARDIO',
    muscle: 'Full Body Conditioning & Core',
    secondaryMuscles: ['Shoulders', 'Arms', 'Back', 'Legs'],
    equipment: 'ROPE',
    isGym: true,
    isHome: false,
    instructions: [
      'ยืนย่อเข่าในท่า Quarter Squat จับปลายเชือกทั้งสองข้างให้มั่นคง',
      'ออกแรงสะบัดแขนขึ้นลงสลับข้างหรือพร้อมกันอย่างรวดเร็วและต่อเนื่อง',
      'เกร็งแกนกลางลำตัวและรักษาจังหวะการหายใจ ทำต่อเนื่อง 30-45 วินาที'
    ],
    tips: 'ใช้แรงส่งจากแกนกลางลำตัวและสะโพก ไม่ใช่ใช้เพียงแรงแขนเท่านั้น',
    icon: '⚡',
    prompt3D: {
      imagePrompt: 'Full-body wide action shot, a 3D faceless grey anatomical mannequin in a quarter-squat athletic stance swinging heavy battle ropes. Shoulders, biceps, triceps, and abdominal core heavily illuminated with glowing red and neon blue overlays. Solid pitch black background, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical cinematic video, mannequin doing fast battle rope waves with dynamic glowing muscles, 4k.'
    }
  },
  {
    id: 'cable-rowing-machine',
    name: 'Cable Rowing Machine',
    nameTh: 'เครื่องพายเรือกรรเชียงบกคาร์ดิโอเผาผลาญไขมัน (Cable Rowing Machine)',
    category: 'CARDIO',
    muscle: 'Cardiovascular Endurance & Full Body',
    secondaryMuscles: ['Lats', 'Legs', 'Core', 'Biceps'],
    equipment: 'CABLE',
    isGym: true,
    isHome: false,
    instructions: [
      'นั่งบนเบาะล็อกเท้าให้แน่น จับด้ามจับด้วยแขนเหยียดตรง ลำตัวเอนไปข้างหน้าเล็กน้อย',
      'ถีบขาเหยียดออกพร้อมกับเอนตัวไปข้างหลังเล็กน้อย แล้วดึงด้ามจับเข้าหาซี่โครงล่าง',
      'เหยียดแขนกลับไปข้างหน้า งอเข่าเลื่อนตัวกลับสู่ตำแหน่งเริ่มต้นในจังหวะต่อเนื่อง'
    ],
    tips: 'ลำดับการเคลื่อนไหวที่ถูกต้องคือ: ขา -> ลำตัว -> แขน ในจังหวะดึง และ แขน -> ลำตัว -> ขา ในจังหวะกลับ',
    icon: '🚣',
    prompt3D: {
      imagePrompt: 'Full-body side view, a 3D faceless grey mannequin on a rowing seat pulling the cable handle to the chest with knees bent. Latissimus dorsi, rhomboids, biceps, and core muscles highlighted in glowing red-orange. Solid black background, 2k resolution, aspect ratio 9:16.',
      videoPrompt: 'Vertical video, full-body side view of a 3D faceless grey mannequin performing a rhythmic cable rowing motion. Back, arms, and core light up in coordinated red-blue glows at the finish phase of each stroke. Pitch black background, Full HD, 1080p.'
    }
  }
];

export const EXERCISE_IMAGE_MAP = {
  // Push Group (Chest Exercises)
  'barbell-bench-press': '/exercises/barbell_bench_press.jpg',
  'db-bench-press': '/exercises/db_bench_press.jpg',
  'db-chest-fly': '/exercises/db_chest_fly.jpg',
  'standing-cable-chest-fly': '/exercises/standing_cable_chest_fly.jpg',
  'kettlebell-floor-press': '/exercises/db_bench_press.jpg',
  'incline-barbell-press': '/exercises/incline_press.jpg',
  'incline-db-bench-press': '/exercises/incline_press.jpg',
  'incline-db-fly': '/exercises/incline_press.jpg',
  'low-to-high-cable-fly': '/exercises/low_to_high_cable_fly.jpg',
  'high-to-low-cable-fly': '/exercises/high_to_low_cable_fly.jpg',
  'decline-db-press': '/exercises/db_bench_press.jpg',
  'incline-push-up': '/exercises/plank.jpg',
  'hex-press': '/exercises/db_bench_press.jpg',
  'db-pullover': '/exercises/overhead_db_extension.jpg',

  // Triceps
  'tricep-pushdown': '/exercises/tricep_pushdown.jpg',
  'overhead-db-extension': '/exercises/overhead_db_extension.jpg',

  // Pull Group
  'lat-pulldown': '/exercises/lat_pulldown.jpg',
  'seated-cable-row': '/exercises/seated_cable_row.jpg',
  'chest-supported-db-row': '/exercises/chest_supported_db_row.jpg',
  'barbell-curl': '/exercises/barbell_curl.jpg',
  'db-hammer-curl': '/exercises/db_hammer_curl.jpg',

  // Shoulders & Core Group
  'seated-db-shoulder-press': '/exercises/seated_db_shoulder_press.jpg',
  'lateral-raise': '/exercises/lateral_raise.jpg',
  'front-raise': '/exercises/front_raise.jpg',
  'db-front-raise': '/exercises/front_raise.jpg',
  'rear-delt-fly': '/exercises/rear_delt_fly.jpg',
  'cable-crunch': '/exercises/cable_crunch.jpg',
  'plank': '/exercises/plank.jpg',

  // Cardio Group
  'battle-rope': '/exercises/battle_rope.jpg',
  'battle-rope-cardio': '/exercises/battle_rope.jpg',
  'cable-rowing-machine': '/exercises/cable_rowing.jpg',
  'cable-rowing-cardio': '/exercises/cable_rowing.jpg',

  // Legacy / Fallbacks
  'bench-press': '/exercises/bench_press.jpg',
  'push-ups': '/exercises/push_ups.jpg',
  'pull-ups': '/exercises/pull_ups.jpg',
  'crunches': '/exercises/cable_crunch.jpg',
};
