import ACLEditor from '@/doc-editors/ACLEditor'
import {describe, test, expect, beforeEach} from '@jest/globals'
import {shallowMount} from '@vue/test-utils'
import Vue from 'vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput'

describe('ACLEditor.vue', () => {
    let docs
    let wrapper
    beforeEach(() => {
        docs = [
            {
                'id': '__default__',
                'name': 'default-acl',
                'allow': [],
                'allow_bot': [
                    'google'
                ],
                'deny_bot': [
                    'yahoo'
                ],
                'bypass': [
                    'internal',
                    'devops'
                ],
                'deny': [
                    'tor'
                ],
                'force_deny': [
                    'china',
                    'ukraine'
                ]
            }
        ]
        wrapper = shallowMount(ACLEditor, {
            propsData: {
                selectedDoc: docs[0]
            }
        })
    })

    test('should have correct ID displayed', () => {
        expect(wrapper.find('.document-id').text()).toEqual(docs[0].id)
    })

    test('should have correct name in input', () => {
        expect(wrapper.find('.document-name').element.value).toEqual(docs[0].name)
    })

    test('should not have any warning in the tags table when there are no duplicate tags', () => {
        const tagsWithWarning = wrapper.findAll('.has-text-danger')
        expect(tagsWithWarning.length).toEqual(0)
    })

    test('should show a warning when there are duplicate tags', async () => {
        docs[0]['deny'].push('test-tag')
        docs[0]['allow'].push('test-tag')
        wrapper = shallowMount(ACLEditor, {
            propsData: {
                selectedDoc: docs[0]
            }
        })
        await Vue.nextTick()
        const tagsWithWarning = wrapper.findAll('.has-text-danger')
        expect(tagsWithWarning.length).toEqual(2)
    })

    test('should show tags as crossed when there are is `all` tag in higher priority', async () => {
        docs[0]['bypass'].push('all')
        wrapper = shallowMount(ACLEditor, {
            propsData: {
                selectedDoc: docs[0]
            }
        })
        await Vue.nextTick()
        const tagCells = wrapper.findAll('.tag-cell')
        const tagCellsCrossed = tagCells.filter((item) => item.element.style.textDecoration === 'line-through')
        expect(tagCellsCrossed.length).toEqual(3)
    })

    test('should not show non bot tags as crossed when there are is `all` tag in higher bot priority', async () => {
        docs[0]['deny_bot'].push('all')
        wrapper = shallowMount(ACLEditor, {
            propsData: {
                selectedDoc: docs[0]
            }
        })
        await Vue.nextTick()
        const tagCells = wrapper.findAll('.tag-cell')
        const tagCellsCrossed = tagCells.filter((item) => item.element.style.textDecoration === 'line-through')
        expect(tagCellsCrossed.length).toEqual(0)
    })

    test('should show bot tags as crossed when there are is `all` tag in higher bot priority', async () => {
        docs[0]['allow_bot'].push('all')
        wrapper = shallowMount(ACLEditor, {
            propsData: {
                selectedDoc: docs[0]
            }
        })
        await Vue.nextTick()
        const tagCells = wrapper.findAll('.tag-cell')
        const tagCellsCrossed = tagCells.filter((item) => item.element.style.textDecoration === 'line-through')
        expect(tagCellsCrossed.length).toEqual(1)
    })

    test('should add tag to correct section when tag selected', async () => {
        const newBypassEntryButton = wrapper.findAll('.add-new-entry-button').at(1)
        newBypassEntryButton.trigger('click')
        await Vue.nextTick()
        const newTag = 'test-tag'
        const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
        tagAutocompleteInput.vm.$emit('tagSubmitted', newTag)
        await Vue.nextTick()
        expect(wrapper.props('selectedDoc').bypass.includes(newTag)).toBeTruthy()
    })

    test('should not add tag when tag selected is 2 or less characters long', async () => {
        const newBypassEntryButton = wrapper.findAll('.add-new-entry-button').at(1)
        newBypassEntryButton.trigger('click')
        await Vue.nextTick()
        const newTag = 't'
        const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
        tagAutocompleteInput.vm.$emit('tagSubmitted', newTag)
        await Vue.nextTick()
        expect(wrapper.props('selectedDoc').bypass.includes(newTag)).toBeFalsy()
    })

    test('should remove tag from correct section when tag removed', async () => {
        const removeBypassEntryButton = wrapper.findAll('.remove-entry-button').at(3)
        removeBypassEntryButton.trigger('click')
        await Vue.nextTick()
        expect(wrapper.props('selectedDoc').bypass).toEqual(['internal'])
    })

    test('should hide tag input when tag selection cancelled', async () => {
        const newBypassEntryButton = wrapper.findAll('.add-new-entry-button').at(1)
        newBypassEntryButton.trigger('click')
        await Vue.nextTick()
        wrapper.vm.cancelAddNewTag()
        await Vue.nextTick()
        const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
        await Vue.nextTick()
        expect(tagAutocompleteInput.element).toBeUndefined()
    })
})
