import { useEffect, useRef, useState, useCallback } from 'react'
import { TB_URL } from '../context/AuthContext'

export function useRooms(token) {
  const [rooms, setRooms] = useState({})  
  const [deviceIds, setDeviceIds] = useState([])
  const [wsStatus, setWsStatus] = useState('idle')
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)

  useEffect(() => {
    if (!token) return

    async function fetchDevices() {
      let page = 0
      let all = []
      try {
        while (true) {
          const res = await fetch(
            `${TB_URL}/api/tenant/devices?pageSize=50&page=${page}`,
            { headers: { 'X-Authorization': `Bearer ${token}` } }
          )
          if (!res.ok) throw new Error('Greška pri dohvaćanju uređaja')
          const data = await res.json()
          all = [...all, ...data.data]
          if (!data.hasNext) break
          page++
        }

        const devices = all

        const ids = devices.map((d) => d.id.id)
        const initialRooms = {}
        devices.forEach((d) => {
          initialRooms[d.id.id] = {
            id: d.id.id,
            name: d.label || d.name,
            motion: null,
            door: null,
            light: null,
          }
        })

        setDeviceIds(ids)
        setRooms(initialRooms)
      } catch (err) {
        console.error(err)
        setWsStatus('error')
      }
    }

    fetchDevices()
  }, [token])

  const connect = useCallback(() => {
    if (!token || deviceIds.length === 0) return

    setWsStatus('connecting')
    const wsUrl = TB_URL.replace('http', 'ws')
    const ws = new WebSocket(`${wsUrl}/api/ws/plugins/telemetry?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('connected')
      const cmds = deviceIds.map((id, i) => ({
        entityType: 'DEVICE',
        entityId: id,
        scope: 'LATEST_TELEMETRY',
        cmdId: i + 1,
      }))
      ws.send(JSON.stringify({ tsSubCmds: cmds, historyCmds: [], attrSubCmds: [] }))
    }

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data)
        if (!msg.subscriptionId) return
        const idx = msg.subscriptionId - 1
        const devId = deviceIds[idx]
        if (!devId) return

        const d = msg.data || {}
        setRooms((prev) => {
          const room = prev[devId]
          if (!room) return prev
          return {
            ...prev,
            [devId]: {
              ...room,
              ...(d.motion !== undefined && { motion: d.motion[0][1] === 'true' }),
              ...(d.door   !== undefined && { door:   d.door[0][1]   === 'true' }),
              ...(d.light  !== undefined && { light:  d.light[0][1]  === 'true' }),
            },
          }
        })
      } catch (e) {
        console.error('Greška ', e)}
    }

    ws.onclose = () => {
      setWsStatus('error')
      reconnectTimer.current = setTimeout(connect, 5000)
    }

    ws.onerror = () => {
      setWsStatus('error')
    }
  }, [token, deviceIds])

  useEffect(() => {
    if (deviceIds.length === 0) return
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect, deviceIds])

  const roomList = Object.values(rooms)
  const stats = {
    total: roomList.length,
    occupied: roomList.filter((r) => r.motion === true).length,
    doorsOpen: roomList.filter((r) => r.door === true).length,
    lightsOn: roomList.filter((r) => r.light === true).length,
  }

  return { rooms, stats, wsStatus }
}
