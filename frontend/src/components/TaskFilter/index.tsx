import React, { useState } from 'react';
import { LuFilter } from "react-icons/lu"
import './task_filter.css'; // Импортируем стили

const TaskFilter = ({ onFilterUpdate, users }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterText, setFilterText] = useState("");
    const [responsiblePerson, setResponsiblePerson] = useState(''); // Заглушка

    // Обработка применения фильтров
    const handleApplyFilters = () => {
        onFilterUpdate({ startDate, endDate, responsiblePerson, filterText });
        setIsOpen(false);
    };

    return (
        <div className="filter-container font-inter">
            <button className="filter-button" onClick={() => 
                setIsOpen(!isOpen)
            }>
                <LuFilter />
            </button>
            <input className = "Text"
                type="text"
                value={filterText}
                onChange={(event) => setFilterText(event.target.value)}
            >
            </input>
            {isOpen && (
                <div className="filter-menu">
                    <div className="filter-entry">
                        <label>Начальная дата:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="filter-entry">
                        <label>Конечная дата:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="filter-entry">
                        <label>Исполнитель</label>
                        <select
                            value={responsiblePerson}
                            onChange={(e) => setResponsiblePerson(e.target.value)}
                        >
                            <option value=''>Все</option>
                            {users.map((user => {
                                return (<option key={user.id} value={user.id}>{user.fullname}</option>)
                            }))}
                        </select>
                    </div>
                    <button className="filter-close-button" onClick={() => setIsOpen(false)}>Закрыть</button>
                </div>
            )}
            <button className = "Apply" onClick={handleApplyFilters}>Применить</button>
        </div>
    );
};

export default TaskFilter;
