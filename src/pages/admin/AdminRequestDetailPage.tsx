import React, { FC, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminHeader } from '../../components/Header'
import { RequestContext } from '../../store/RequestContext'
import M from 'materialize-css'
import { AuthContext } from '../../store/AuthContext'
import { useFormater } from '../../hooks/useFormater'
import $api from '../../http'
import { Loader } from '../../components/Loader'

export const AdminRequestDetailPage: FC = () => {
  const { id1, id2 } = useParams()
  const pointRef = useRef(null)
  const percentRef = useRef(null)
  const messageRef = useRef(null)
  const btnRef = useRef(null)
  const {
    requests,
    fetchRequests,
    setPoints,
    setExamPoints,
    addComment,
    setStatus,
    setPercent,
  } = useContext(RequestContext)
  const { fio, avatarUrl, role, id } = useContext(AuthContext)
  const request = requests.find(r => r.id === Number(id1))
  const subRequest = requests
    .find(r => r.id === Number(id1))
    ?.subRequests.find(sb => sb.id === Number(id2))
  const [message, setMessage] = useState('')
  const _ = useFormater()
  const modalRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    M.Modal.init(modalRef.current!)

    if (!requests.length) fetchRequests()
  }, [])
  useEffect(() => {
    if (pointRef.current && percentRef.current!) {
      // @ts-ignore
      pointRef.current!.focus()
      // @ts-ignore
      percentRef.current!.focus()
    }

    document.querySelectorAll('.tooltipped').forEach(el => {
      const url = el.getAttribute('data-tooltip-img')
      M.Tooltip.init(el, {
        html: `<img src="${url}" class="tooltip-img" />`,
      })
    })

    M.FloatingActionButton.init(btnRef.current!, {
      toolbarEnabled: true,
    })
  }, [requests.length])

  const saveHandler = async () => {
    try {
      await $api.post('/api/requests/get/', {
        id: subRequest?.id,
        point: subRequest?.point,
      })
      await $api.post('/api/requests/set-admin-row-point/', {
        id: subRequest?.id,
        data: subRequest?.tables.body.map(b => b.points),
      })

      if (subRequest?.nomination === 'Учебная деятельность') {
        await $api.post('/api/requests/learning/save/', {
          id: subRequest?.id,
          linkToGradebook: subRequest.linkToGradebook,
          percent: subRequest.percent,
          point: subRequest.point,
        })
      }

      M.toast({
        html: 'Данные были успешно сохранены!',
        classes: 'light-blue darken-1',
      })
    } catch (e) {
      // M.toast({
      //   html: `<span>Что-то пошло не так: <b>${e}</b></span>`,
      //   classes: 'red darken-4',
      // })
    }
  }
  const sendHandler = () => {
    try {
      if (message.trim().length === 0)
        return M.toast({
          html: `<span>Что-то пошло не так: <b>Комментрий не должен быть пустым!</b></span>`,
          classes: 'red darken-4',
        })

      addComment(
        request?.id!,
        subRequest?.id!,
        fio,
        avatarUrl,
        message,
        role,
        id
      )
      setMessage('')
      M.toast({
        html: 'Вы успешно оставили комментарий!',
        classes: 'light-blue darken-1',
      })
    } catch (e) {
      // M.toast({
      //   html: `<span>Что-то пошло не так: <b>${e}</b></span>`,
      //   classes: 'red darken-4',
      // })
    }
  }

  if (!requests.length) {
    return <Loader header={<AdminHeader />} />
  }

  return (
    <>
      <AdminHeader />
      <div className='container'>
        <h3 className='mt-4'>Информация о заявлении</h3>
        <table>
          <thead className='striped'>
            <tr>
              <th>Кампания</th>
              <th>Номинация</th>
              <th>Учебный план</th>
              <th>Статус</th>
              <th>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{request?.company}</td>
              <td>{subRequest?.nomination}</td>
              <td>{subRequest?.learningPlan}</td>

              <td>{subRequest?.status}</td>
              <td>{_(subRequest?.createdDate)}</td>
            </tr>
          </tbody>
        </table>
        <h3 className='mt-4'>Информация о студенте</h3>
        <table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Телефон</th>
              <th>Статус</th>
              <th>Институт</th>
              <th>Направление</th>
              <th>Форма обучения</th>
              <th>Источник финансирования</th>
              <th>Уровень</th>
              <th>Курс</th>
              <th>Дата последнего изменения</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{request?.fio}</td>
              <td>{subRequest?.phone}</td>
              <td>{subRequest?.status}</td>
              <td>{subRequest?.institute}</td>
              <td>{subRequest?.direction}</td>
              <td>{subRequest?.educationForm}</td>
              <td>{subRequest?.financingSource}</td>
              <td>{subRequest?.level}</td>
              <td>{subRequest?.course}</td>
              <td>{_(subRequest?.changedDate)}</td>
            </tr>
          </tbody>
        </table>
        {subRequest?.nomination === 'Учебная деятельность' ? (
          <>
            <h3 className='mt-4'>Оценки</h3>
            <div>
              {/* <div className='input-field'>
                <input
                  type='text'
                  id='percent'
                  ref={percentRef}
                  value={subRequest?.percent}
                  onKeyPress={event => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault()
                    }
                  }}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setPercent(
                      request?.id!,
                      subRequest?.id!,
                      Number(event.target.value)
                    )
                  }
                  style={{ maxWidth: 'fit-content' }}
                />
                <label htmlFor='point'>Процент</label>
              </div> */}
              <div className='input-field'>
                <input
                  type='text'
                  id='point'
                  ref={pointRef}
                  value={subRequest?.point}
                  onKeyPress={event => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault()
                    }
                  }}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setExamPoints(
                      request?.id!,
                      subRequest?.id!,
                      Number(event.target.value)
                    )
                  }
                  style={{ maxWidth: 'fit-content' }}
                />
                <label htmlFor='point'>Балл</label>
              </div>
            </div>
            <a
              className='waves-effect waves-light btn light-blue darken-1 tooltipped'
              target='_blank'
              href={
                subRequest.linkToGradebook === 'Документ'
                  ? 'javascript:void(0)'
                  : subRequest.linkToGradebook
              }
              data-position='top'
              data-tooltip-img={subRequest.linkToGradebook}
            >
              <i className='material-icons'>insert_drive_file</i>
            </a>
          </>
        ) : null}

        <h3 className='mt-4'>
          Достижения
          <small
            style={{
              float: 'right',
            }}
          >
            Всего:{' '}
            <b>
              {subRequest?.tables.body
                .map(b => b.points)
                .reduce((p, c) => p + c, 0)! + subRequest?.point!}
            </b>
          </small>
        </h3>
        <table className='responsive-table'>
          <thead>
            <tr>
              {subRequest?.tables.header.map((h, hIdx) => (
                <th key={hIdx}>{h}</th>
              ))}
              <th>Баллы</th>
            </tr>
          </thead>
          <tbody>
            {subRequest?.tables.body.map((r, rIdx) => {
              return (
                <tr key={rIdx}>
                  {r.data.map((b, bIdx) => {
                    try {
                      if (!(bIdx === 7)) throw Error()

                      return (
                        <td key={bIdx}>
                          <a
                            className='waves-effect waves-light btn light-blue darken-1 tooltipped'
                            target='_blank'
                            href={b === 'Документ' ? 'javascript:void(0)' : b}
                            data-position='top'
                            data-tooltip-img={b}
                          >
                            <i className='material-icons'>insert_drive_file</i>
                          </a>
                        </td>
                      )
                    } catch (e) {
                      return <td key={bIdx}>{b}</td>
                    }
                  })}
                  <td>
                    <input
                      type='text'
                      value={r.points}
                      style={{ maxWidth: 'fit-content' }}
                      key={'input' + rIdx}
                      onKeyPress={event => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault()
                        }
                      }}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setPoints(
                          request!.id,
                          subRequest.id,
                          rIdx,
                          Number(event.target.value)
                        )
                      }
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <button
          className='btn light-blue darken-2 waves-effect waves-light'
          style={{ marginTop: 36, float: 'right' }}
          onClick={saveHandler}
        >
          <i className='material-icons left'>save</i>
          Сохранить изменения
        </button>
        <h3 className='mt-4'>Комментарии</h3>
        <div>
          {subRequest?.comments.map((c, idx) => {
            return (
              <div key={idx} className='comment'>
                <div className='avatar'>
                  <img src={c.imageUrl} alt='avatar' />
                  <span>{c.name}</span>
                </div>
                <p>{c.text}</p>
                <small>{c.sendedDate.toLocaleString()}</small>
              </div>
            )
          })}
        </div>
        <div className='input-field'>
          <textarea
            id='message'
            className='materialize-textarea mt-4'
            data-length='1000'
            value={message}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              if (message.length <= 1000) setMessage(event.target.value)
            }}
            ref={messageRef}
          ></textarea>
          <label className='message'>Сообщение</label>
        </div>
        <button
          className='btn light-blue darken-2 waves-effect waves-light'
          style={{ float: 'right' }}
          onClick={sendHandler}
        >
          <i className='material-icons left'>send</i>
          Отправить комментарий
        </button>
      </div>
      {!(
        // subRequest?.status === 'Победитель' ||
        // subRequest?.status === 'Принято' ||
        (subRequest?.status === 'Удалено')
      ) ? (
        <div className='fixed-action-btn toolbar' ref={btnRef}>
          <a className='btn-floating btn-large light-blue darken-4 pulse'>
            <i className='large material-icons'>mode_edit</i>
          </a>
          <ul>
            <li>
              <a>
                <button
                  className='waves-effect waves-light yellow darken-2 btn'
                  onClick={() => {
                    try {
                      setStatus(
                        request?.id!,
                        subRequest?.id!,
                        'Отправлено на доработку'
                      )
                      addComment(
                        request?.id!,
                        subRequest?.id!,
                        fio,
                        avatarUrl,
                        'Статус изменён на "Отправлено на доработку"',
                        role,
                        id
                      )

                      const i = M.Modal.getInstance(modalRef.current!)
                      i.open()

                      M.toast({
                        html: '<span>Вы успешно выставили статус <strong>Отправлено на доработку</strong> !</span>',
                        classes: 'light-blue darken-1',
                      })
                    } catch (e) {
                      M.toast({
                        html: `<span>Что-то пошло не так: <b>${e}</b></span>`,
                        classes: 'red darken-4',
                      })
                    }
                  }}
                >
                  Отправлено на доработку
                </button>
              </a>
            </li>
            <li>
              <a>
                <button
                  className='waves-effect waves-light light-blue darken-3 btn'
                  onClick={() => {
                    try {
                      setStatus(request?.id!, subRequest?.id!, 'Принято')
                      addComment(
                        request?.id!,
                        subRequest?.id!,
                        fio,
                        avatarUrl,
                        'Статус изменён на "Принято"',
                        role,
                        id
                      )
                      M.toast({
                        html: '<span>Вы успешно выставили статус <strong>Принято</strong> !</span>',
                        classes: 'light-blue darken-1',
                      })
                    } catch (e) {
                      M.toast({
                        html: `<span>Что-то пошло не так: <b>${e}</b></span>`,
                        classes: 'red darken-4',
                      })
                    }
                  }}
                >
                  Принято
                </button>
              </a>
            </li>
            <li>
              <a>
                <button
                  className='waves-effect waves-light teal darken-1 btn'
                  onClick={() => {
                    try {
                      setStatus(request?.id!, subRequest?.id!, 'Победитель')
                      addComment(
                        request?.id!,
                        subRequest?.id!,
                        fio,
                        avatarUrl,
                        'Статус изменён на "Победитель"',
                        role,
                        id
                      )
                      M.toast({
                        html: '<span>Вы успешно выставили статус <strong>Победитель</strong> !</span>',
                        classes: 'light-blue darken-1',
                      })
                    } catch (e) {
                      M.toast({
                        html: `<span>Что-то пошло не так: <b>${e}</b></span>`,
                        classes: 'red darken-4',
                      })
                    }
                  }}
                >
                  Победитель
                </button>
              </a>
            </li>
          </ul>
        </div>
      ) : null}
      <div style={{ height: 100 }}></div>
      {/* modal */}
      <div ref={modalRef} className='modal'>
        <div className='modal-content'>
          <h4>Оставьте комментарии</h4>
          <div style={{ height: 20 }} />
          <div className='input-field'>
            <textarea
              id='message'
              className='materialize-textarea mt-4'
              data-length='1000'
              value={message}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                if (message.length <= 1000) setMessage(event.target.value)
              }}
              ref={messageRef}
            ></textarea>
            <label className='message'>Сообщение</label>
          </div>
          <button
            className='btn light-blue darken-2 waves-effect waves-light'
            style={{ float: 'right' }}
            onClick={() => {
              sendHandler()
              navigate('/admin/requests/')
            }}
          >
            <i className='material-icons left'>send</i>
            Отправить комментарий
          </button>
          <div style={{ height: 20 }} />
        </div>
      </div>
    </>
  )
}
