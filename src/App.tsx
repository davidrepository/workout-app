import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { Heading } from "./components/typography";
import useFormInput from "./hooks/useFormInput";

import { FileInput, Label } from "flowbite-react";
import DatePicker from "react-datepicker";

import { ArrowIcon, DeleteIcon, ErrorIcon, InfoIcon } from "./icons";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

// THIS SHOULD GO TO ENV
const REACT_APP_API_KEY = "8DX8eEe67njS1lbThFsdSw==rQQNpQ8PYbPZBjrx";
//

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const firstNameInput = useFormInput("");
  const lastNameInput = useFormInput("");
  const emailInput = useFormInput("");
  const ageInput = useFormInput(8);

  const [emailError, setEmailError] = useState(false);

  const [nationalHolidayDates, setNationalHolidayDates] = useState([]);

  const [observances, setObservances] = useState([]);
  const [observanceDates, setObservanceDates] = useState([]);
  const [observanceName, setObservanceName] = useState("");

  const [fileLoaded, setFileLoaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef: any = useRef(null);

  const isFormFilledExpression = useMemo(
    () =>
      firstNameInput.value &&
      lastNameInput.value &&
      emailInput.value &&
      !emailError &&
      ageInput.value &&
      fileLoaded,
    [
      firstNameInput.value,
      lastNameInput.value,
      emailInput.value,
      emailError,
      ageInput.value,
      fileLoaded,
    ]
  );

  const isFormFilled: any = useMemo(
    () => isFormFilledExpression,
    [isFormFilledExpression]
  );

  // FETCH HOLIDAYS, OBSERVANCES
  useEffect(() => {
    const constructQueryString = (queryParams: any) => {
      let queryString = "";
      for (const param in queryParams) {
        queryString += `${param}=${queryParams[param]}&`;
      }
      queryString = queryString.slice(0, -1);
      return queryString;
    };

    const fetchHolidays = async () => {
      const queryParams: any = {
        country: "PL",
        year: 2023,
        type: "national_holiday",
        "X-Api-Key": REACT_APP_API_KEY,
      };

      try {
        const queryString = constructQueryString(queryParams);
        const url = `https://api.api-ninjas.com/v1/holidays?${queryString}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch holidays");
        }
        const data = await response.json();
        const excludedHolidays = data.map(
          (holiday: any) => new Date(holiday.date)
        );
        setNationalHolidayDates(excludedHolidays);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    const fetchObservance = async () => {
      const queryParams: any = {
        country: "PL",
        year: 2023,
        type: "observance",
        "X-Api-Key": REACT_APP_API_KEY,
      };

      try {
        const queryString = constructQueryString(queryParams);
        const url = `https://api.api-ninjas.com/v1/holidays?${queryString}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch holidays");
        }
        const observancesData = await response.json();
        const observanceDatesList = observancesData.map(
          (holiday: any) => new Date(holiday.date)
        );

        setObservances(observancesData);
        setObservanceDates(observanceDatesList);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    fetchHolidays();
    fetchObservance();
  }, []);

  // DATE INPUT
  const dayClassName = (date: any) => {
    const day = date.getDay();
    let classes = [];
    if (day === 0) {
      classes.push("sunday");
    }

    return classes.join(" ");
  };

  const handleDateChange = useCallback(
    (date: any) => {
      setCurrentDate(date);

      const currentObservanceDate: any = observances.find(
        (h: any) => new Date(h.date).toDateString() === date.toDateString()
      );
      if (currentObservanceDate) {
        setObservanceName(currentObservanceDate?.name);
      } else {
        setObservanceName("");
      }
    },
    // eslint-disable-next-line
    [currentDate]
  );

  // FILE INPUT
  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileLoaded(true);
      setFileName(file.name);
    } else {
      setFileLoaded(false);
      setFileName("");
    }
  };

  const handleFileDelation = (e: any) => {
    e.preventDefault();
    setFileLoaded(false);
    setFileName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // RANGE INPUT
  const calculatePosition = useCallback(() => {
    const gridWidth = 16;
    const halfGridWidth = gridWidth / 2;
    const position =
      ((ageInput.value - halfGridWidth) / (100 - halfGridWidth)) * 100;

    let offset = 8;

    if (position >= 50) {
      offset = (-halfGridWidth * (position - 50)) / 50;
    } else if (position < 50) {
      offset = (halfGridWidth * (50 - position)) / 50;
    }

    const sign = Math.sign(offset);
    const leftPosition =
      sign === 1
        ? `calc(${position}% + ${offset}px)`
        : `calc(${position}% - ${Math.abs(offset)}px)`;

    return leftPosition;
    // eslint-disable-next-line
  }, [ageInput.value]);

  // EMAIL INPUT
  const handleValidate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };

  const handleEmailValidateOnBlur = () => {
    handleValidate();
  };

  const handleEmailValidateOnChange = (e: any) => {
    emailInput.onChange(e);
    if (emailError) {
      handleValidate();
    }
  };

  // FORM
  const handleFormSubmit = async (event: any) => {
    event.preventDefault();

    if (emailError) {
      return;
    }

    if (isFormFilled) {
      console.log({
        data: [
          firstNameInput.value,
          lastNameInput.value,
          emailInput.value,
          ageInput.value,
          currentDate.toISOString(),
        ],
      });

      const formData = new FormData();
      formData.append("firstName", firstNameInput.value);
      formData.append("lastName", lastNameInput.value);
      formData.append("email", emailInput.value);
      formData.append("age", ageInput.value);
      formData.append("currentDate", currentDate.toISOString());

      try {
        const response = await fetch("http://letsworkout.pl/submit", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("Successfully submitted");
        } else {
          console.error("Failed to submit");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="App flex justify-center max-w-md w-full m-auto py-20">
      <form className="w-full" onSubmit={handleFormSubmit}>
        <div className="wrapper grid grid-flow-row gap-12 w-full">
          <div className="grid grid-flow-row gap-8 w-full">
            <Heading text="Personal Info" />
            <div className="grid gap-6">
              <div>
                <div className="grid grid-flow-row gap-2">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    name="firstName"
                    className="rounded-lg h-12 border px-4 border-brand-2 focus:border-brand-3"
                    {...firstNameInput}
                  />
                </div>
              </div>

              <div>
                <div className="grid grid-flow-row gap-2">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    name="lastName"
                    className="rounded-lg h-12 border px-4 border-brand-2 focus:border-brand-3"
                    {...lastNameInput}
                  />
                </div>
              </div>

              <div>
                <div className="grid grid-flow-row gap-2">
                  <label htmlFor="email">E-mail Address</label>
                  <input
                    name="email"
                    className={`rounded-lg h-12 border px-4 border-brand-2 focus:border-brand-3 ${
                      emailError ? "error:bg error:border" : ""
                    }`}
                    {...emailInput}
                    value={emailInput.value}
                    onChange={handleEmailValidateOnChange}
                    onBlur={handleEmailValidateOnBlur}
                  />
                  {emailError && (
                    <span className="w-2/3 text-sm flex gap-2 mt-1">
                      <ErrorIcon className="flex-shrink-0" />
                      <span>
                        Please use correct formatting.
                        <br />
                        Example: address@email.com
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="grid grid-flow-row gap-2 pb-9">
                  <label htmlFor="age">Age</label>
                  <div className="range text-xs">
                    <div className="range__field">
                      <div className="range__values-container">
                        <span className="range__value-left">8</span>
                        <span className="range__value-right">100</span>
                      </div>
                      <input
                        name="age"
                        type="range"
                        min="8"
                        max="100"
                        step="1"
                        {...ageInput}
                      />
                    </div>
                    <div
                      className="range__current"
                      style={{ left: calculatePosition() }}
                    >
                      <span>{ageInput.value}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="dropzone-file">Photo</label>
                <Label
                  htmlFor="dropzone-file"
                  className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-brand-2 bg-white"
                >
                  <div className="flex flex-col items-center justify-center">
                    {fileLoaded ? (
                      <span className="flex gap-1 items-center">
                        <span className="font-medium">{fileName}</span>
                        <div
                          onClick={handleFileDelation}
                          style={{ cursor: "pointer" }}
                        >
                          <DeleteIcon />
                        </div>
                      </span>
                    ) : (
                      <p>
                        <span
                          style={{
                            textDecoration: "underline",
                            color: "var(--brand-color-3)",
                          }}
                        >
                          Upload a file
                        </span>{" "}
                        <span
                          style={{ color: "var(--color-gray-1)" }}
                          className="hidden md:inline"
                        >
                          or drag and drop here
                        </span>
                      </p>
                    )}
                  </div>
                  <FileInput
                    ref={fileInputRef}
                    id="dropzone-file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            <Heading text="Your workout" />
            <div>
              <div
                className="grid gap-6 text-left mb-2"
                style={{ gridTemplateColumns: "1fr 76px" }}
              >
                <span>Date</span>
                <span className="hidden md:inline">Time</span>
              </div>

              <DatePicker
                renderCustomHeader={({
                  monthDate,
                  decreaseMonth,
                  increaseMonth,
                }: any) => (
                  <div className="mb-2">
                    <button
                      aria-label="Previous Month"
                      className={
                        "react-datepicker__navigation react-datepicker__navigation--previous"
                      }
                      onClick={decreaseMonth}
                    >
                      <span
                        className={
                          "react-datepicker__navigation-icon react-datepicker__navigation-icon--previous"
                        }
                      >
                        <ArrowIcon mirror />
                      </span>
                    </button>
                    <span className="react-datepicker__current-month">
                      {monthDate.toLocaleString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      aria-label="Next Month"
                      className={
                        "react-datepicker__navigation react-datepicker__navigation--next"
                      }
                      onClick={increaseMonth}
                    >
                      <span
                        className={
                          "react-datepicker__navigation-icon react-datepicker__navigation-icon--next"
                        }
                      >
                        <ArrowIcon />
                      </span>
                    </button>
                  </div>
                )}
                selected={currentDate}
                onChange={handleDateChange}
                calendarStartDay={1}
                dayClassName={(date: any) => dayClassName(date)}
                inline
                showTimeSelect
                timeFormat="HH:mm"
                excludeDates={nationalHolidayDates}
                highlightDates={observanceDates}
              />

              {observanceName && (
                <span className="text-sm mt-2 flex items-center gap-2">
                  <span>
                    <InfoIcon />
                  </span>
                  <span>It is Polish National {observanceName}.</span>
                </span>
              )}
            </div>
          </div>
          <button
            className={`h-11 text-white rounded-lg text-lg font-medium hover:bg-brand-4 ${
              isFormFilled ? "bg-brand-3" : "bg-brand-2 disabled"
            }`}
          >
            Send Application
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
