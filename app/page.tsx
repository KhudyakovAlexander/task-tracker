"use client";
import { FormEvent, useEffect, useState } from "react";
type RequestStatus =
  | "Выставлено"
  | "В работе"
  | "Ожидает подтверждения"
  | "Выполнено"
  | "Отклонено";

type RequestItem = {
  number: number;
  subject: string;
  description: string;
  status: RequestStatus;
  author: string;
  confirmer: string;
  deadline: string;
  control: string;
  isOverdue?: boolean;
  acceptedBy?: string;
  acceptedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
    sentForConfirmationBy?: string;
  sentForConfirmationAt?: string;
  completedAt?: string;
  returnReason?: string;
};

const requests: RequestItem[] = [
  {
    number: 125,
    subject: "Настроить рабочее место нового сотрудника",
    description:
    "Подготовить компьютер для нового сотрудника: установить ПО, создать учётную запись и подключить принтер.",
    status: "В работе",
    author: "Иванов И.И.",
    confirmer: "Петров П.П.",
    deadline: "18.04.2026 17:00",
    control: "Просрочено на 2 ч. 15 мин.",
    isOverdue: true,
  },
  {
    number: 124,
    subject: "Выдать доступ к общей папке",
    description: "Предоставить доступ к общей рабочей папке.",
    status: "Выставлено",
    author: "Сидоров С.С.",
    confirmer: "Сидоров С.С.",
    deadline: "19.04.2026 12:00",
    control: "Ожидает принятия",
  },
  {
    number: 123,
    subject: "Подготовить служебный документ",
    description: "Подготовить и проверить служебный документ.",
    status: "Ожидает подтверждения",
    author: "Иванов И.И.",
    confirmer: "Иванов И.И.",
    deadline: "17.04.2026 18:00",
    control: "Просрочено на 1 день",
    isOverdue: true,
  },
  {
    number: 122,
    subject: "Проверить подключение принтера",
    description: "Проверить подключение офисного принтера.",
    status: "Выполнено",
    author: "Петров П.П.",
    confirmer: "Петров П.П.",
    deadline: "16.04.2026 14:00",
    control: "—",
  },
  {
  number: 121,
  subject: "Настроить доступ к внутренней системе",
  description: "Требуется предоставить доступ к внутренней системе.",
  status: "Отклонено",
  author: "Сидоров С.С.",
  confirmer: "Иванов И.И.",
  deadline: "15.04.2026 12:00",
  control: "—",
  rejectedBy: "Петров П.П.",
  rejectedAt: "15.04.2026 09:40",
  rejectionReason: "Необходимо уточнить, к какой именно системе требуется доступ.",
},
];
const DEMO_STORAGE_KEY = "task-tracker-demo-requests";

function statusClass(status: RequestStatus) {
  const classes: Record<RequestStatus, string> = {
    Выставлено: "bg-amber-100 text-amber-800 ring-amber-200",
    "В работе": "bg-blue-100 text-blue-800 ring-blue-200",
    "Ожидает подтверждения":
      "bg-violet-100 text-violet-800 ring-violet-200",
    Выполнено: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    Отклонено: "bg-slate-200 text-slate-700 ring-slate-300",
  };

  return classes[status];
}

export default function Home() {
  const [items, setItems] = useState<RequestItem[]>(requests);
  const [isDemoDataLoaded, setIsDemoDataLoaded] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
const [searchText, setSearchText] = useState("");
const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "Все">(
  "Все",
);
const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);
const [showWaitingForAcceptance, setShowWaitingForAcceptance] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [confirmer, setConfirmer] = useState("Иванов И.И.");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
const [rejectionReason, setRejectionReason] = useState("");
const [rejectionError, setRejectionError] = useState("");
const [isSendForConfirmationOpen, setIsSendForConfirmationOpen] =
  useState(false);
const [confirmationComment, setConfirmationComment] = useState("");

const [isReturnOpen, setIsReturnOpen] = useState(false);
const [returnReason, setReturnReason] = useState("");
const [returnError, setReturnError] = useState("");
  useEffect(() => {
    try {
      const savedItems = window.localStorage.getItem(DEMO_STORAGE_KEY);

      if (savedItems) {
        const parsedItems = JSON.parse(savedItems) as RequestItem[];

        if (Array.isArray(parsedItems)) {
          setItems(parsedItems);
        }
      }
    } catch {
      // Если временные данные повреждены, остаются стартовые заявки.
    } finally {
      setIsDemoDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isDemoDataLoaded) {
      return;
    }

    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(items));
  }, [items, isDemoDataLoaded]);

  function openCreateForm() {
    setSubject("");
    setDescription("");
    setConfirmer("Иванов И.И.");
    setDeadline("");
    setFormError("");
    setIsCreateOpen(true);
  }

  function closeCreateForm() {
    setIsCreateOpen(false);
  }

  function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subject.trim() || !description.trim() || !deadline) {
      setFormError("Заполните тему, описание и срок выполнения.");
      return;
    }

    const selectedDeadline = new Date(deadline);

    if (Number.isNaN(selectedDeadline.getTime())) {
      setFormError("Укажите корректные дату и время срока.");
      return;
    }

    if (selectedDeadline.getTime() <= Date.now()) {
      setFormError("Срок выполнения должен быть в будущем.");
      return;
    }

    const nextNumber = Math.max(...items.map((item) => item.number), 0) + 1;

    const newRequest: RequestItem = {
      number: nextNumber,
      subject: subject.trim(),
      description: description.trim(),
      status: "Выставлено",
      author: "Иванов И.И.",
      confirmer,
      deadline: selectedDeadline.toLocaleString("ru-RU", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      control: "Ожидает принятия",
    };

    setItems((currentItems) => [newRequest, ...currentItems]);
    setIsCreateOpen(false);
  }
    function acceptRequest() {
    if (!selectedRequest) {
      return;
    }

    const acceptedAt = new Date().toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const updatedRequest: RequestItem = {
      ...selectedRequest,
      status: "В работе",
      acceptedBy: "Иванов И.И.",
      acceptedAt,
      control: "Срок выполнения контролируется",
      isOverdue: false,
    };

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.number === updatedRequest.number ? updatedRequest : item,
      ),
    );

    setSelectedRequest(updatedRequest);
  }

  function openRejectForm() {
    setRejectionReason("");
    setRejectionError("");
    setIsRejectOpen(true);
  }

  function rejectRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRequest) {
      return;
    }

    if (!rejectionReason.trim()) {
      setRejectionError("Укажите причину отклонения.");
      return;
    }

    const rejectedAt = new Date().toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const updatedRequest: RequestItem = {
      ...selectedRequest,
      status: "Отклонено",
      rejectedBy: "Иванов И.И.",
      rejectedAt,
      rejectionReason: rejectionReason.trim(),
      control: "—",
      isOverdue: false,
    };

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.number === updatedRequest.number ? updatedRequest : item,
      ),
    );

    setSelectedRequest(updatedRequest);
    setIsRejectOpen(false);
  }
    function openSendForConfirmationForm() {
    setConfirmationComment("");
    setIsSendForConfirmationOpen(true);
  }

  function sendForConfirmation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRequest) {
      return;
    }

    const sentForConfirmationAt = new Date().toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const updatedRequest: RequestItem = {
      ...selectedRequest,
      status: "Ожидает подтверждения",
      sentForConfirmationBy: "Иванов И.И.",
      sentForConfirmationAt,
      control: "Ожидает подтверждения",
      isOverdue: false,
    };

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.number === updatedRequest.number ? updatedRequest : item,
      ),
    );

    setSelectedRequest(updatedRequest);
    setIsSendForConfirmationOpen(false);
  }

  function openReturnForm() {
    setReturnReason("");
    setReturnError("");
    setIsReturnOpen(true);
  }

  function returnToWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRequest) {
      return;
    }

    if (!returnReason.trim()) {
      setReturnError("Укажите комментарий для доработки.");
      return;
    }

    const updatedRequest: RequestItem = {
      ...selectedRequest,
      status: "В работе",
      returnReason: returnReason.trim(),
      control: "Срок выполнения контролируется",
      isOverdue: false,
    };

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.number === updatedRequest.number ? updatedRequest : item,
      ),
    );

    setSelectedRequest(updatedRequest);
    setIsReturnOpen(false);
  }

  function completeRequest() {
    if (!selectedRequest) {
      return;
    }

    const completedAt = new Date().toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const updatedRequest: RequestItem = {
      ...selectedRequest,
      status: "Выполнено",
      completedAt,
      control: "—",
      isOverdue: false,
    };

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.number === updatedRequest.number ? updatedRequest : item,
      ),
    );

    setSelectedRequest(updatedRequest);
  }
    const filteredItems = items.filter((item) => {
    const normalizedSearch = searchText.trim().toLocaleLowerCase("ru-RU");

    const matchesSearch =
      !normalizedSearch ||
      String(item.number).includes(normalizedSearch) ||
      item.subject.toLocaleLowerCase("ru-RU").includes(normalizedSearch) ||
      item.description.toLocaleLowerCase("ru-RU").includes(normalizedSearch) ||
      item.author.toLocaleLowerCase("ru-RU").includes(normalizedSearch) ||
      item.confirmer.toLocaleLowerCase("ru-RU").includes(normalizedSearch);

    const matchesStatus =
      selectedStatus === "Все" || item.status === selectedStatus;

    const matchesOverdue = !showOnlyOverdue || Boolean(item.isOverdue);

    const matchesWaitingForAcceptance =
      !showWaitingForAcceptance || item.status === "Выставлено";

    return (
      matchesSearch &&
      matchesStatus &&
      matchesOverdue &&
      matchesWaitingForAcceptance
    );
  });
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Трекер заявок</h1>
            <p className="text-sm text-slate-500">
              Внутренняя система работы с заявками
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">Иванов И.И.</span>
            <button className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Заявки
          </p>

          <nav className="space-y-1 text-sm">
            <a className="block rounded-md bg-slate-100 px-3 py-2 font-medium" href="#">
              Все заявки
            </a>
            <a className="block rounded-md px-3 py-2 hover:bg-slate-100" href="#">
              Ожидают принятия
            </a>
            <a className="block rounded-md px-3 py-2 text-red-700 hover:bg-red-50" href="#">
              Просроченные
            </a>
            <a className="block rounded-md px-3 py-2 hover:bg-slate-100" href="#">
              В работе
            </a>
            <a className="block rounded-md px-3 py-2 hover:bg-slate-100" href="#">
              Ожидают подтверждения
            </a>
            <a className="block rounded-md px-3 py-2 hover:bg-slate-100" href="#">
              Выполненные
            </a>
            <a className="block rounded-md px-3 py-2 hover:bg-slate-100" href="#">
              Отклонённые
            </a>
          </nav>

          <div className="my-4 border-t border-slate-200" />

          <a className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100" href="#">
            Пользователи
          </a>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold">Все заявки</h2>
              <p className="mt-1 text-sm text-slate-500">
                Показано: {filteredItems.length} из {items.length}
              </p>
            </div>

            <button className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                onClick={openCreateForm}
                >
              + Создать заявку
            </button>
          </div>

          <div className="mb-5 rounded-lg bg-white p-4 shadow-sm">
            <input
  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  onChange={(event) => setSearchText(event.target.value)}
  placeholder="Поиск по номеру, теме, описанию или пользователю..."
  type="search"
  value={searchText}
/>

            <div className="mt-3 flex flex-wrap gap-2">
  {(["Все", "Выставлено", "В работе", "Ожидает подтверждения", "Выполнено", "Отклонено"] as const).map(
    (status) => (
      <button
        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
          selectedStatus === status
            ? "bg-slate-800 text-white"
            : "bg-slate-100 hover:bg-slate-200"
        }`}
        key={status}
        onClick={() => setSelectedStatus(status)}
        type="button"
      >
        {status}
      </button>
    ),
  )}
</div>
<div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
  <label className="flex cursor-pointer items-center gap-2">
    <input
      checked={showOnlyOverdue}
      className="h-4 w-4 accent-red-600"
      onChange={(event) => setShowOnlyOverdue(event.target.checked)}
      type="checkbox"
    />
    <span className="font-medium text-red-700">Только просроченные</span>
  </label>

  <label className="flex cursor-pointer items-center gap-2">
    <input
      checked={showWaitingForAcceptance}
      className="h-4 w-4 accent-amber-600"
      onChange={(event) => setShowWaitingForAcceptance(event.target.checked)}
      type="checkbox"
    />
    <span className="font-medium text-amber-800">
      Ожидают принятия
    </span>
  </label>
</div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">№</th>
                    <th className="px-4 py-3 font-semibold">Тема</th>
                    <th className="px-4 py-3 font-semibold">Статус</th>
                    <th className="px-4 py-3 font-semibold">Автор</th>
                    <th className="px-4 py-3 font-semibold">Подтверждающий</th>
                    <th className="px-4 py-3 font-semibold">Срок</th>
                    <th className="px-4 py-3 font-semibold">Контроль срока</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredItems.length === 0 && (
  <tr>
    <td
      className="px-4 py-10 text-center text-sm text-slate-500"
      colSpan={7}
    >
      По вашему запросу заявок не найдено.
    </td>
  </tr>
)}
                  {filteredItems.map((request) => (
                    <tr
  className={`cursor-pointer hover:bg-slate-50 ${
    request.isOverdue ? "bg-red-50/60" : ""
  }`}
  key={request.number}
  onClick={() => setSelectedRequest(request)}
>
                      <td className="px-4 py-4 font-semibold text-blue-700">
                        №{request.number}
                      </td>
                      <td className="max-w-xs px-4 py-4 font-medium">
                        {request.subject}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(
                            request.status,
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {request.author}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {request.confirmer}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {request.deadline}
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-4 text-xs font-medium ${
                          request.isOverdue ? "text-red-700" : "text-slate-500"
                        }`}
                      >
                        {request.control}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
                 {selectedRequest && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/50 p-4">
          <div className="mx-auto my-8 w-full max-w-3xl rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold">
                    Заявка №{selectedRequest.number}
                  </h3>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(
                      selectedRequest.status,
                    )}`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>

                <p className="mt-2 text-lg font-medium text-slate-800">
                  {selectedRequest.subject}
                </p>
              </div>

              <button
                aria-label="Закрыть карточку заявки"
                className="rounded-md px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100"
                onClick={() => setSelectedRequest(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              <section>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Основная информация
                </h4>

                <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Автор заявки</dt>
                    <dd className="mt-1 font-medium">
                      {selectedRequest.author}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Подтверждающий</dt>
                    <dd className="mt-1 font-medium">
                      {selectedRequest.confirmer}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Срок выполнения</dt>
                    <dd className="mt-1 font-medium">
                      {selectedRequest.deadline}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Контроль срока</dt>
                    <dd
                      className={`mt-1 font-medium ${
                        selectedRequest.isOverdue
                          ? "text-red-700"
                          : "text-slate-700"
                      }`}
                    >
                      {selectedRequest.control}
                    </dd>
                  </div>
                </dl>

                {selectedRequest.acceptedBy && (
                  <div className="mt-5 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
                    <span className="font-semibold">Принял в работу: </span>
                    {selectedRequest.acceptedBy}
                    {selectedRequest.acceptedAt
                      ? ` · ${selectedRequest.acceptedAt}`
                      : ""}
                  </div>
                )}

                {selectedRequest.rejectedBy && (
                  <div className="mt-5 rounded-md bg-slate-100 p-3 text-sm text-slate-800">
                    <p>
                      <span className="font-semibold">Отклонил: </span>
                      {selectedRequest.rejectedBy}
                      {selectedRequest.rejectedAt
                        ? ` · ${selectedRequest.rejectedAt}`
                        : ""}
                    </p>

                    <p className="mt-2">
                      <span className="font-semibold">Причина: </span>
                      {selectedRequest.rejectionReason}
                    </p>
                  </div>
                )}
                                {selectedRequest.sentForConfirmationBy && (
                  <div className="mt-5 rounded-md bg-violet-50 p-3 text-sm text-violet-900">
                    <span className="font-semibold">
                      Отправил на подтверждение:{" "}
                    </span>
                    {selectedRequest.sentForConfirmationBy}
                    {selectedRequest.sentForConfirmationAt
                      ? ` · ${selectedRequest.sentForConfirmationAt}`
                      : ""}
                  </div>
                )}

                {selectedRequest.returnReason && (
                  <div className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                    <span className="font-semibold">
                      Возвращено в работу:{" "}
                    </span>
                    {selectedRequest.returnReason}
                  </div>
                )}

                {selectedRequest.completedAt && (
                  <div className="mt-5 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">
                    <span className="font-semibold">
                      Выполнение подтверждено:{" "}
                    </span>
                    {selectedRequest.completedAt}
                  </div>
                )}
              </section>

              <section className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Описание
                </h4>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedRequest.description}
                </p>
              </section>

              <section className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Вложения
                </h4>

                <p className="mt-3 text-sm text-slate-500">
                  Вложений пока нет. Загрузка файлов до 100 МБ на заявку будет
                  добавлена после подключения постоянного хранения.
                </p>
              </section>

              <section className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  История
                </h4>

                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  Заявка отображается в демонстрационном режиме. История
                  действий будет добавлена вместе с настоящей базой данных.
                </div>
              </section>
            </div>

                        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 p-4">
              {selectedRequest.status === "Выставлено" && (
                <>
                  <button
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    onClick={acceptRequest}
                    type="button"
                  >
                    Принять в работу
                  </button>

                  <button
                    className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    onClick={openRejectForm}
                    type="button"
                  >
                    Отклонить
                  </button>
                </>
              )}

              {selectedRequest.status === "В работе" && (
                <button
                  className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                  onClick={openSendForConfirmationForm}
                  type="button"
                >
                  Отправить на подтверждение
                </button>
              )}

              {selectedRequest.status === "Ожидает подтверждения" &&
                selectedRequest.confirmer === "Иванов И.И." && (
                  <>
                    <button
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      onClick={completeRequest}
                      type="button"
                    >
                      Подтвердить выполнение
                    </button>

                    <button
                      className="rounded-md border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50"
                      onClick={openReturnForm}
                      type="button"
                    >
                      Вернуть в работу
                    </button>
                  </>
                )}

              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setSelectedRequest(null)}
                type="button"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
            {isRejectOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
          <form
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onSubmit={rejectRequest}
          >
            <h3 className="text-xl font-bold">Отклонить заявку</h3>

            <p className="mt-2 text-sm text-slate-500">
              Укажите причину: это обязательное поле.
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-medium">Причина отклонения *</span>
              <textarea
                className="mt-1 min-h-28 w-full resize-y rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                onChange={(event) => setRejectionReason(event.target.value)}
                value={rejectionReason}
              />
            </label>

            {rejectionError && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {rejectionError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setIsRejectOpen(false)}
                type="button"
              >
                Отмена
              </button>

              <button
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                type="submit"
              >
                Отклонить заявку
              </button>
            </div>
          </form>
        </div>
      )}
            {isSendForConfirmationOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
          <form
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onSubmit={sendForConfirmation}
          >
            <h3 className="text-xl font-bold">Отправить на подтверждение</h3>

            <p className="mt-2 text-sm text-slate-500">
              При необходимости добавьте комментарий. Он не обязателен.
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-medium">Комментарий</span>
              <textarea
                className="mt-1 min-h-28 w-full resize-y rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                onChange={(event) => setConfirmationComment(event.target.value)}
                value={confirmationComment}
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setIsSendForConfirmationOpen(false)}
                type="button"
              >
                Отмена
              </button>

              <button
                className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                type="submit"
              >
                Отправить
              </button>
            </div>
          </form>
        </div>
      )}
            {isReturnOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
          <form
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onSubmit={returnToWork}
          >
            <h3 className="text-xl font-bold">Вернуть заявку в работу</h3>

            <p className="mt-2 text-sm text-slate-500">
              Укажите, что нужно доработать. Это обязательное поле.
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-medium">
                Комментарий для доработки *
              </span>

              <textarea
                className="mt-1 min-h-28 w-full resize-y rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                onChange={(event) => setReturnReason(event.target.value)}
                value={returnReason}
              />
            </label>

            {returnError && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {returnError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setIsReturnOpen(false)}
                type="button"
              >
                Отмена
              </button>

              <button
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                type="submit"
              >
                Вернуть в работу
              </button>
            </div>
          </form>
        </div>
      )}
            {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
            onSubmit={createRequest}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Создание заявки</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Поля со звёздочкой обязательны для заполнения.
                </p>
              </div>

              <button
                aria-label="Закрыть форму"
                className="rounded-md px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100"
                onClick={closeCreateForm}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Тема *</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(event) => setSubject(event.target.value)}
                  value={subject}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Описание *</span>
                <textarea
                  className="mt-1 min-h-28 w-full resize-y rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(event) => setDescription(event.target.value)}
                  value={description}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Подтверждающий *</span>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(event) => setConfirmer(event.target.value)}
                  value={confirmer}
                >
                  <option>Иванов И.И.</option>
                  <option>Петров П.П.</option>
                  <option>Сидоров С.С.</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Срок выполнения *</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(event) => setDeadline(event.target.value)}
                  type="datetime-local"
                  value={deadline}
                />
              </label>

              <p className="text-sm text-slate-500">
                Вложения будут добавлены на следующем шаге. Максимальный
                суммарный размер вложений для заявки: 100 МБ.
              </p>

              {formError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                onClick={closeCreateForm}
                type="button"
              >
                Отмена
              </button>

              <button
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                type="submit"
              >
                Выставить заявку
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}