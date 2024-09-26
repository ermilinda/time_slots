import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { DataItem, SelectedSlots, TimeSlot } from './config/interfaces';

const DataFetchingComponent = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlots>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<DataItem[]>('/data.json');
        setData(response.data);
      } catch (err) {
        console.log('error', err);
      }
    };

    fetchData();
  }, []);

  const groupTimeSlotsByCompanyAndDay = (companies: DataItem[]) => {
    const groupedData: Record<string, Record<string, TimeSlot[]>> = {};

    companies.forEach((company) => {
      groupedData[company.name] = {};
      company.time_slots.forEach((slot) => {
        const dayName = dayjs(slot.start_time).format("dddd")
        if (!groupedData[company.name][dayName]) {
          groupedData[company.name][dayName] = [];
        }
        groupedData[company.name][dayName].push(slot);
      });
    });

    return groupedData;
  };
  const groupedDatas = groupTimeSlotsByCompanyAndDay(data);

  const isSlotDisabled = (slot: TimeSlot, companyName: string) => {
    const slotStart = new Date(slot.start_time).getTime();
    const slotEnd = new Date(slot.end_time).getTime();
    const selectedSlot = selectedSlots[companyName];

    if (selectedSlot) {
      const selectedStart = new Date(selectedSlot.start_time).getTime();
      const selectedEnd = new Date(selectedSlot.end_time).getTime();

      return slotStart !== selectedStart || slotEnd !== selectedEnd;
    }

    return Object.entries(selectedSlots).some(
      ([otherCompany, otherSelectedSlot]) => {
        if (!otherSelectedSlot) return false;

        const otherSelectedStart = new Date(
          otherSelectedSlot.start_time
        ).getTime();
        const otherSelectedEnd = new Date(otherSelectedSlot.end_time).getTime();

        return slotStart < otherSelectedEnd && slotEnd > otherSelectedStart;
      }
    );
  };
  const handleSlotClick = (companyName: string, slot: TimeSlot) => {
    const currentSelection = selectedSlots[companyName];
    const newSelection =
      currentSelection &&
      currentSelection.start_time === slot.start_time &&
      currentSelection.end_time === slot.end_time
        ? null
        : { start_time: slot.start_time, end_time: slot.end_time };

    setSelectedSlots((prevSelected) => ({
      ...prevSelected,
      [companyName]: newSelection,
    }));
  };
  return (
    <div className='mainContainer'>
      {Object.entries(groupedDatas).map(([companyName, days]) => {
        const selectedHours = selectedSlots[companyName];
        return (
          <div key={companyName}>
            <div className='companyName'>{companyName}</div>
            <div className='selectedSlots'>
              {selectedHours
                ? `${dayjs(selectedHours.start_time).format('HH:mm')} - ${dayjs(
                    selectedHours.end_time
                  ).format('HH:mm')}`
                : ''}
            </div>
            <div className='mainHeader'>
              {Object.entries(days).map(([day, slots]) => (
                <div key={day} className='company'>
                  <p>{day}</p>
                  {slots.map((slot, index) => (
                    <button
                      key={index}
                      style={{
                        color: isSlotDisabled(slot, companyName)
                          ? 'red'
                          : 'green',
                      }}
                      disabled={isSlotDisabled(slot, companyName)}
                      onClick={() => handleSlotClick(companyName, slot)}
                    >
                      <span>{dayjs(slot.start_time).format('HH:mm')} - </span>
                      <span>{dayjs(slot.end_time).format('HH:mm')}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DataFetchingComponent;