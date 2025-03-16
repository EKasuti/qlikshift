export const jmcPayload = {
    desk_name: "JMC",
    term_or_break: "Spring Term",
    year: "2025",
    opening_time: "10:00",
    closing_time: "17:00",
    term_slots: [
        {
            day_of_week: "Monday",
            is_open: true,
            shifts: [
                { start_time: "10:00", end_time: "12:00", max_students: 1 },
                { start_time: "12:00", end_time: "17:00", max_students: 2 },
            ],
        },
        {
            day_of_week: "Tuesday",
            is_open: true,
            shifts: [
                { start_time: "10:00", end_time: "12:00", max_students: 1 },
                { start_time: "12:00", end_time: "17:00", max_students: 2 },
            ],
        },
        {
            day_of_week: "Wednesday",
            is_open: true,
            shifts: [
                { start_time: "10:00", end_time: "12:00", max_students: 1 },
                { start_time: "12:00", end_time: "17:00", max_students: 2 },
            ],
        },
        {
            day_of_week: "Thursday",
            is_open: true,
            shifts: [
                { start_time: "10:00", end_time: "12:00", max_students: 1 },
                { start_time: "12:00", end_time: "17:00", max_students: 2 },
            ],
        },
        {
            day_of_week: "Friday",
            is_open: true,
            shifts: [
                { start_time: "10:00", end_time: "12:00", max_students: 1 },
                { start_time: "12:00", end_time: "17:00", max_students: 2 },
            ],
        },
        { day_of_week: "Saturday", is_open: false, shifts: [] },
        { day_of_week: "Sunday", is_open: false, shifts: [] },
    ],
};
  
export const circPayload = {
    desk_name: "CIRC",
    term_or_break: "Spring Term",
    year: "2025",
    opening_time: "08:00",
    closing_time: "24:00",
    term_slots: [
        {
            day_of_week: "Monday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Tuesday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Wednesday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Thursday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Friday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "22:00", max_students: 1 }],
        },
        {
            day_of_week: "Saturday",
            is_open: true,
            shifts: [{ start_time: "14:00", end_time: "22:00", max_students: 2 }],
        },
        {
            day_of_week: "Sunday",
            is_open: true,
            shifts: [{ start_time: "14:00", end_time: "24:00", max_students: 2 }],
        },
    ],
};

export const bakerPayload = {
    desk_name: "BAKER",
    term_or_break: "Spring Term",
    year: "2025",
    opening_time: "08:00",
    closing_time: "24:00",
    term_slots: [
        {
            day_of_week: "Monday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Tuesday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Wednesday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Thursday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Friday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "22:00", max_students: 1 }],
        },
        {
            day_of_week: "Saturday",
            is_open: true,
            shifts: [{ start_time: "10:00", end_time: "22:00", max_students: 1 }],
        },
        {
            day_of_week: "Sunday",
            is_open: true,
            shifts: [{ start_time: "10:00", end_time: "24:00", max_students: 1 }],
        },
    ]
};

export const orozcoPayload = {
    desk_name: "OROZCO",
    term_or_break: "Spring Term",
    year: "2025",
    opening_time: "08:00",
    closing_time: "24:00",
    term_slots: [
        {
            day_of_week: "Monday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Tuesday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Wednesday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Thursday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "24:00", max_students: 1 }],
        },
        {
            day_of_week: "Friday",
            is_open: true,
            shifts: [{ start_time: "08:00", end_time: "22:00", max_students: 1 }],
        },
        {
            day_of_week: "Saturday",
            is_open: true,
            shifts: [{ start_time: "10:00", end_time: "22:00", max_students: 1 }],
        },
        {
            day_of_week: "Sunday",
            is_open: true,
            shifts: [{ start_time: "10:00", end_time: "24:00", max_students: 1 }],
        },
    ]
};